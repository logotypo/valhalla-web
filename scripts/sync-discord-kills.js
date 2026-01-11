import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// CONFIGURATION
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1447605633087180840';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY; // Or Service Role Key if RLS blocks anon

if (!DISCORD_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchDiscordMessages() {
    const response = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=50`, {
        headers: {
            Authorization: `Bot ${DISCORD_TOKEN}`
        }
    });

    if (!response.ok) {
        throw new Error(`Discord API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

function parseMessage(content, id, timestamp) {
    // Regex patterns based on the provided log format
    // Killer [blue] \n Name SteamID: ID
    const killerRegex = /Killer \[blue\]\n(.+) SteamID: (.+)/;
    // Victim [red] \n Name SteamID: ID
    const victimRegex = /Victim \[red\]\n(.+) SteamID: (.+)/;
    // Weapon \n Name
    const weaponRegex = /Weapon\n(.+)/;
    // Distance \n Value
    const distanceRegex = /Distance\n(.+)/;

    const killerMatch = content.match(killerRegex);
    const victimMatch = content.match(victimRegex);
    const weaponMatch = content.match(weaponRegex);
    const distanceMatch = content.match(distanceRegex);

    if (!killerMatch || !victimMatch) {
        return null;
    }

    return {
        discord_message_id: id,
        timestamp: timestamp,
        killer_name: killerMatch[1].trim(),
        killer_steam_id: killerMatch[2].trim(),
        victim_name: victimMatch[1].trim(),
        victim_steam_id: victimMatch[2].trim(),
        weapon: weaponMatch ? weaponMatch[1].trim() : null,
        distance: distanceMatch ? distanceMatch[1].trim() : null
    };
}

async function sync() {
    try {
        console.log('Fetching messages from Discord...');
        const messages = await fetchDiscordMessages();
        console.log(`Fetched ${messages.length} messages.`);

        const events = [];
        for (const msg of messages) {
            if (!msg.content) continue;

            const parsed = parseMessage(msg.content, msg.id, msg.timestamp);
            if (parsed) {
                events.push(parsed);
            }
        }

        console.log(`Parsed ${events.length} valid kill events.`);

        if (events.length > 0) {
            const { error } = await supabase
                .from('kill_events')
                .upsert(events, { onConflict: 'discord_message_id' });

            if (error) {
                console.error('Supabase Error:', error);
            } else {
                console.log('Successfully synced events to Supabase!');
            }
        }
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

sync();
