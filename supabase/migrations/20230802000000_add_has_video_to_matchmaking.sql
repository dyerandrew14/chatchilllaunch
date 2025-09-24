-- Add has_video column to matchmaking table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matchmaking' AND column_name = 'has_video') THEN
        ALTER TABLE public.matchmaking ADD COLUMN has_video BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
