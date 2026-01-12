-- Function to update profile stats on new kill event
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update Killer Stats if the steam_id matches a profile
    UPDATE public.profiles
    SET kills = COALESCE(kills, 0) + 1
    WHERE steam_id = NEW.killer_steam_id;

    -- Update Victim Stats if the steam_id matches a profile
    UPDATE public.profiles
    SET deaths = COALESCE(deaths, 0) + 1
    WHERE steam_id = NEW.victim_steam_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_kill_event_insert ON public.kill_events;
CREATE TRIGGER on_kill_event_insert
AFTER INSERT ON public.kill_events
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_stats();
