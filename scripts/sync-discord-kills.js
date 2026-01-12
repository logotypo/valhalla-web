import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

// CONFIGURATION
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1447605633087180840';

// Use env vars for Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!DISCORD_TOKEN) {
    console.error('Missing DISCORD_TOKEN environment variable');
    process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE credentials');
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
        let killerName, killerSteamId, victimName, victimSteamId, weapon, distance;

        // Helper to parse "Name SteamID: ID"
        // Regex matches "Name SteamID: 12345"
        const parseIdentity = (text) => {
            if (!text) return null;
            const match = text.match(/(.+?)\s+SteamID:\s*(\d+)/i);
            return match ? { name: match[1].trim(), steamId: match[2].trim() } : null;
        };

        // 1. Check Embeds (Priority because ValhallaBot uses embeds)
        if (msg.embeds && msg.embeds.length > 0) {
            const embed = msg.embeds[0];

            // A. Search in Fields
            if (embed.fields) {
                for (const field of embed.fields) {
                    if (field.name.includes('Killer')) {
                        const data = parseIdentity(field.value);
                        if (data) { killerName = data.name; killerSteamId = data.steamId; }
                    }
                    if (field.name.includes('Victim')) {
                        const data = parseIdentity(field.value);
                        if (data) { victimName = data.name; victimSteamId = data.steamId; }
                    }
                    if (field.name.includes('Weapon')) weapon = field.value;
                    if (field.name.includes('Distance')) distance = field.value;
                }
            }

            // B. Fallback: Search in Description
            if ((!killerName || !victimName) && embed.description) {
                const lines = embed.description.split('\n');
                let currentRole = null;

                for (const line of lines) {
                    if (line.includes('Killer')) currentRole = 'killer';
                    else if (line.includes('Victim')) currentRole = 'victim';

                    if (line.includes('SteamID')) {
                        const data = parseIdentity(line);
                        if (data) {
                            if (currentRole === 'killer') { killerName = data.name; killerSteamId = data.steamId; }
                            if (currentRole === 'victim') { victimName = data.name; victimSteamId = data.steamId; }
                        }
                    }
                }

                // Try regex on full description if loop failed
                if (!killerName) {
                    const kMatch = embed.description.match(/Killer.*?\[blue\].*?\n(.+?)\s+SteamID:\s*(\d+)/i);
                    if (kMatch) { killerName = kMatch[1].trim(); killerSteamId = kMatch[2].trim(); }
                }
                if (!victimName) {
                    const vMatch = embed.description.match(/Victim.*?\[red\].*?\n(.+?)\s+SteamID:\s*(\d+)/i);
                    if (vMatch) { victimName = vMatch[1].trim(); victimSteamId = vMatch[2].trim(); }
                }
            }
        }

        // 2. Fallback to Content (Text)
        if ((!killerName || !victimName) && msg.content) {
            const killerRegex = /Killer\s*\[blue\]\s*\n(.+?)\s+SteamID:\s*(.+?)(\n|$)/i;
            const victimRegex = /Victim\s*\[red\]\s*\n(.+?)\s+SteamID:\s*(.+?)(\n|$)/i;
            const killerMatch = msg.content.match(killerRegex);
            const victimMatch = msg.content.match(victimRegex);

            if (killerMatch) { killerName = killerMatch[1].trim(); killerSteamId = killerMatch[2].trim(); }
            if (victimMatch) { victimName = victimMatch[1].trim(); victimSteamId = victimMatch[2].trim(); }
        }

        if (killerName && victimName) {
            return {
                discord_message_id: msg.id,
                timestamp: msg.timestamp, // REST API uses .timestamp (ISO String)
                killer_name: killerName,
                killer_steam_id: killerSteamId,
                victim_name: victimName,
                victim_steam_id: victimSteamId,
                weapon: weapon || 'Desconocido',
                distance: distance || '?'
            };
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
