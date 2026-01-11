import { createClient } from '@supabase/supabase-js';

// CONFIGURATION
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1447605633087180840';
// Fallback to hardcoded keys if env vars are missing (Common in this project setup)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ajafhmoptknlpuzjpamq.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYWZobW9wdGtubHB1empwYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTExMDgsImV4cCI6MjA4MzU4NzEwOH0.wdeqlk6PXtj7ezPkgXUDqU_RFpq9uwY4FHzx9jb3eVU';

if (!DISCORD_TOKEN) {
    console.error('Missing DISCORD_TOKEN environment variable');
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
        const text = await response.text();
        throw new Error(`Discord API Error: ${response.status} ${response.statusText} - ${text}`);
    }

    return response.json();
}

function parseMessage(content, id, timestamp) {
    try {
        // Regex Patterns - Made more robust with [\s\S]*? for multiline matching
        // Killer [blue] (newline) (Name) SteamID: (ID)
        const killerRegex = /Killer\s*\[blue\]\s*\n(.+?)\s+SteamID:\s*(.+?)(\n|$)/i;
        const victimRegex = /Victim\s*\[red\]\s*\n(.+?)\s+SteamID:\s*(.+?)(\n|$)/i;

        // Weapon (newline) (Name)
        const weaponRegex = /Weapon\s*\n(.+?)(\n|$)/i;
        const distanceRegex = /Distance\s*\n(.+?)(\n|$)/i;

        const killerMatch = content.match(killerRegex);
        const victimMatch = content.match(victimRegex);
        const weaponMatch = content.match(weaponRegex);
        const distanceMatch = content.match(distanceRegex);

        if (!killerMatch || !victimMatch) {
            // console.log(`Skipping message ${id}: No match found.`);
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
    } catch (err) {
        console.warn(`Error parsing message ${id}:`, err);
        return null;
    }
}

async function sync() {
    try {
        console.log('Fetching messages from Discord...');
        const messages = await fetchDiscordMessages();
        console.log(`Fetched ${messages.length} messages.`);

        if (messages.length > 0) {
            console.log('--- SAMPLE MESSAGE START ---');
            console.log(messages[0].content);
            console.log('--- SAMPLE MESSAGE END ---');
        }

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
                throw error;
            } else {
                console.log('Successfully synced events to Supabase!');
            }
        } else {
            console.log('No new valid events found to sync.');
        }
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

sync();
