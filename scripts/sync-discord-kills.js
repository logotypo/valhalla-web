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

function parseMessage(msg) {
    try {
        // 1. Try Parse from Content (Old Text method)
        if (msg.content) {
            const killerRegex = /Killer\s*\[blue\]\s*\n(.+?)\s+SteamID:\s*(.+?)(\n|$)/i;
            const victimRegex = /Victim\s*\[red\]\s*\n(.+?)\s+SteamID:\s*(.+?)(\n|$)/i;
            const killerMatch = msg.content.match(killerRegex);
            const victimMatch = msg.content.match(victimRegex);

            if (killerMatch && victimMatch) {
                return {
                    discord_message_id: msg.id,
                    timestamp: msg.timestamp,
                    killer_name: killerMatch[1].trim(),
                    killer_steam_id: killerMatch[2].trim(),
                    victim_name: victimMatch[1].trim(),
                    victim_steam_id: victimMatch[2].trim(),
                    weapon: 'Unknown', // regex for weapon/distance on plain text left out for brevity as embeds are likely
                    distance: 'Unknown'
                };
            }
        }

        // 2. Try Parse from Embeds (New Visual method)
        if (msg.embeds && msg.embeds.length > 0) {
            const embed = msg.embeds[0];
            let killerName, killerSteamId, victimName, victimSteamId, weapon, distance;

            // Helper to parse "Name SteamID: ID"
            const parseIdentity = (text) => {
                const match = text.match(/(.+?)\s+SteamID:\s*(\d+)/i);
                return match ? { name: match[1].trim(), steamId: match[2].trim() } : null;
            };

            // Search in Fields
            if (embed.fields) {
                for (const field of embed.fields) {
                    if (field.name.includes('Killer [blue]')) {
                        const data = parseIdentity(field.value);
                        if (data) { killerName = data.name; killerSteamId = data.steamId; }
                    }
                    if (field.name.includes('Victim [red]')) {
                        const data = parseIdentity(field.value);
                        if (data) { victimName = data.name; victimSteamId = data.steamId; }
                    }
                    if (field.name.includes('Weapon')) weapon = field.value;
                    if (field.name.includes('Distance')) distance = field.value;
                }
            }

            // Fallback: Search in Description if fields are not clear (some bots put everything in desc)
            if ((!killerName || !victimName) && embed.description) {
                const killerRegex = /Killer\s*\[blue\]\s*\n(.+?)\s+SteamID:\s*(.+?)(\n|$)/i;
                const victimRegex = /Victim\s*\[red\]\s*\n(.+?)\s+SteamID:\s*(.+?)(\n|$)/i;
                const kMatch = embed.description.match(killerRegex);
                const vMatch = embed.description.match(victimRegex);
                if (kMatch) { killerName = kMatch[1].trim(); killerSteamId = kMatch[2].trim(); }
                if (vMatch) { victimName = vMatch[1].trim(); victimSteamId = vMatch[2].trim(); }
            }

            if (killerName && victimName) {
                return {
                    discord_message_id: msg.id,
                    timestamp: msg.timestamp,
                    killer_name: killerName,
                    killer_steam_id: killerSteamId,
                    victim_name: victimName,
                    victim_steam_id: victimSteamId,
                    weapon: weapon || null,
                    distance: distance || null
                };
            }
        }

        return null;
    } catch (err) {
        console.warn(`Error parsing message ${msg.id}:`, err);
        return null;
    }
}

async function sync() {
    try {
        console.log('Fetching messages from Discord...');
        const messages = await fetchDiscordMessages();
        console.log(`Fetched ${messages.length} messages.`);

        // DEBUG: Log the structure of the first message to verify format
        if (messages.length > 0) {
            console.log('--- MSG STRUCTURE ---');
            console.log(JSON.stringify(messages[0], null, 2));
            console.log('---------------------');
        }

        const events = [];
        for (const msg of messages) {
            const parsed = parseMessage(msg);
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
