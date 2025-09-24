-- Add matched_at column to matchmaking table
ALTER TABLE public.matchmaking
ADD COLUMN IF NOT EXISTS matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add matched_with column if it doesn't exist (referenced in the code but not in the original migration)
ALTER TABLE public.matchmaking
ADD COLUMN IF NOT EXISTS matched_with UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS matchmaking_matched_at_idx ON public.matchmaking (matched_at);
