-- Update RLS policies for matchmaking table to be more permissive

-- First, drop existing policies
DROP POLICY IF EXISTS "Allow users to read their own matchmaking entries" ON public.matchmaking;
DROP POLICY IF EXISTS "Allow users to insert their own matchmaking entries" ON public.matchmaking;
DROP POLICY IF EXISTS "Allow users to update their own matchmaking entries" ON public.matchmaking;

-- Create more permissive policies
-- Allow users to read any matchmaking entry
CREATE POLICY "Allow users to read matchmaking entries"
ON public.matchmaking
FOR SELECT
USING (true);

-- Allow users to insert their own matchmaking entries
CREATE POLICY "Allow users to insert matchmaking entries"
ON public.matchmaking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update matchmaking entries where they are the user or the matched user
CREATE POLICY "Allow users to update matchmaking entries"
ON public.matchmaking
FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = matched_with);

-- Allow users to delete their own matchmaking entries
CREATE POLICY "Allow users to delete their own matchmaking entries"
ON public.matchmaking
FOR DELETE
USING (auth.uid() = user_id);
