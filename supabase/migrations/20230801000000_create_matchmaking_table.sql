-- Create matchmaking table
CREATE TABLE IF NOT EXISTS public.matchmaking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('waiting', 'matched', 'completed')),
    room_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    has_video BOOLEAN DEFAULT FALSE
);

-- Create RLS policies
ALTER TABLE public.matchmaking ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own matchmaking entries
CREATE POLICY "Allow users to read their own matchmaking entries"
ON public.matchmaking
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own matchmaking entries
CREATE POLICY "Allow users to insert their own matchmaking entries"
ON public.matchmaking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own matchmaking entries
CREATE POLICY "Allow users to update their own matchmaking entries"
ON public.matchmaking
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS matchmaking_user_id_idx ON public.matchmaking (user_id);
CREATE INDEX IF NOT EXISTS matchmaking_status_idx ON public.matchmaking (status);
CREATE INDEX IF NOT EXISTS matchmaking_room_id_idx ON public.matchmaking (room_id);
