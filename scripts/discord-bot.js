import { Client, GatewayIntentBits } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// CONFIGURATION
// Token from previous steps, or load from .env if user set it up
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'MTQ1OTk2MTMyNTEzMTE0MTI0NA.G3fPu1.GKjM67hDiK08zuTFBZMm3ET2GBJN9_zK9_arXo';
const CHANNEL_ID = '1447605633087180840';

// Hardcoded Supabase for reliability in this specific env
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ajafhmoptknlpuzjpamq.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYWZobW9wdGtubHB1empwYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTExMDgsImV4cCI6MjA4MzU4NzEwOH0.wdeqlk6PXtj7ezPkgXUDqU_RFpq9uwY4FHzx9jb3eVU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    console.log(`👀 Escuchando muertes en el canal: ${CHANNEL_ID}`);
});

client.on('messageCreate', async (msg) => {
    // Ignore bots (except the one we are tracking which IS a bot)
    // But we must ignore ourselves to avoid loops
    if (msg.author.id === client.user.id) return;

    // Only listen to specific channel
    if (msg.channelId !== CHANNEL_ID) return;

    console.log(`📨 Nuevo mensaje recibido de ${msg.author.username}`);

    try {
        const event = parseMessage(msg);

        if (event) {
            console.log(`💀 Muerte detectada: ${event.killer_name} mató a ${event.victim_name}`);

            const { error } = await supabase
                .from('kill_events')
                .upsert(event, { onConflict: 'discord_message_id' });

            if (error) {
                console.error('❌ Error guardando en Supabase:', error);
            } else {
                console.log('✅ ¡Guardado en base de datos!');
            }
        } else {
            // console.log('⚠️ No se reconocio como kill feed valido.');
        }
    } catch (error) {
        console.error('Error procesando mensaje:', error);
    }
});

function parseMessage(msg) {
    try {
        let killerName, killerSteamId, victimName, victimSteamId, weapon, distance;

        // Helper to parse "Name SteamID: ID"
        // Regex flexible para: "Logotypo SteamID: 76561198169229015"
        const parseIdentity = (text) => {
            const match = text.match(/(.+?)\s+SteamID:\s*(\d+)/i);
            return match ? { name: match[1].trim(), steamId: match[2].trim() } : null;
        };

        // 1. Check Embeds (Priority)
        if (msg.embeds && msg.embeds.length > 0) {
            const embed = msg.embeds[0];

            // Search in Fields
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

            // Fallback: Search in Description
            if ((!killerName || !victimName) && embed.description) {
                // Regex adaptado a la captura del usuario
                // Killer [blue] \n Logotypo SteamID: 76561198169229015
                const identityRegex = /(?:Killer|Victim).+?\n(.+?)\s+SteamID:\s*(\d+)/gi;

                const lines = embed.description.split('\n');
                let currentRole = null; // 'killer' or 'victim'

                for (const line of lines) {
                    if (line.includes('Killer')) currentRole = 'killer';
                    else if (line.includes('Victim')) currentRole = 'victim';
                    else if (line.includes('Weapon')) currentRole = 'weapon';
                    else if (line.includes('Distance')) currentRole = 'distance';
                    else if (line.includes('SteamID')) {
                        const data = parseIdentity(line);
                        if (data && currentRole === 'killer') { killerName = data.name; killerSteamId = data.steamId; }
                        if (data && currentRole === 'victim') { victimName = data.name; victimSteamId = data.steamId; }
                    }
                }
            }
        }

        if (killerName && victimName) {
            return {
                discord_message_id: msg.id,
                timestamp: msg.createdAt, // Discord.js uses createdAt Date object
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
        console.warn(`Error parsing details:`, err);
        return null;
    }
}

client.login(DISCORD_TOKEN);
