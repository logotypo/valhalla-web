
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

// Fallback to hardcoded keys if env vars are missing
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ajafhmoptknlpuzjpamq.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYWZobW9wdGtubHB1empwYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTExMDgsImV4cCI6MjA4MzU4NzEwOH0.wdeqlk6PXtj7ezPkgXUDqU_RFpq9uwY4FHzx9jb3eVU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PLAYERS = [
    { name: 'Arbe', steamId: '76561198000000001' },
    { name: 'PITBULL', steamId: '76561198000000002' },
    { name: 'Vla2', steamId: '76561198000000003' },
    { name: 'AleKingYt', steamId: '76561198000000004' },
    { name: 'Coyote', steamId: '76561198000000005' },
    { name: 'Logotypo', steamId: '76561198169229015' } // Test User
];

const WEAPONS = ['AK-47', 'SVD', 'M82', 'Improvised Bow', 'Katana', 'MK18'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
    console.log('🌱 Seeding fake kill events...');

    const events = [];
    for (let i = 0; i < 30; i++) {
        const killer = getRandomItem(PLAYERS);
        let victim = getRandomItem(PLAYERS);

        // Ensure killer != victim
        while (victim.steamId === killer.steamId) {
            victim = getRandomItem(PLAYERS);
        }

        events.push({
            discord_message_id: `fake-msg-${Date.now()}-${i}`,
            killer_name: killer.name,
            killer_steam_id: killer.steamId,
            victim_name: victim.name,
            victim_steam_id: victim.steamId,
            weapon: getRandomItem(WEAPONS),
            distance: `${Math.floor(Math.random() * 800)}m`,
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
        });
    }

    const { error } = await supabase
        .from('kill_events')
        .upsert(events);

    if (error) {
        console.error('Error seeding:', error);
    } else {
        console.log('✅ 30 fake kill events inserted!');
    }
}

seed();
