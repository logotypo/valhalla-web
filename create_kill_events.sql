-- Create kill_events table
CREATE TABLE IF NOT EXISTS public.kill_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discord_message_id TEXT UNIQUE NOT NULL,
    killer_name TEXT NOT NULL,
    killer_steam_id TEXT NOT NULL,
    victim_name TEXT NOT NULL,
    victim_steam_id TEXT NOT NULL,
    weapon TEXT,
    distance TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.kill_events ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read (to display stats)
CREATE POLICY "Allow public read access" ON public.kill_events
    FOR SELECT USING (true);

-- Only service role (GitHub Actions) can insert/update
-- (Ideally we use a service key or valid JWT, for now facilitating insertion via same means)
-- Allow authenticated insert for now (we'll secure this via the script using service key or admin user)
CREATE POLICY "Allow authenticated insert" ON public.kill_events
    FOR INSERT TO authenticated WITH CHECK (true);
