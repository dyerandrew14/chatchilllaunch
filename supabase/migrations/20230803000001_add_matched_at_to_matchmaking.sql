-- Add matched_at column to matchmaking table if it doesn't exist
ALTER TABLE public.matchmaking
ADD COLUMN IF NOT EXISTS matched_at TIMESTAMPTZ DEFAULT now();

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_matchmaking_matched_at ON public.matchmaking(matched_at);
