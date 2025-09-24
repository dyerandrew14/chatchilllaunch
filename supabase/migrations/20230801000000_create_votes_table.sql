-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, target_user_id)
);

-- Add RLS policies
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read all votes
CREATE POLICY "Anyone can read votes"
  ON votes FOR SELECT
  USING (true);

-- Policy to allow authenticated users to insert their own votes
CREATE POLICY "Users can insert their own votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own votes
CREATE POLICY "Users can update their own votes"
  ON votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own votes
CREATE POLICY "Users can delete their own votes"
  ON votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS votes_user_id_idx ON votes(user_id);
CREATE INDEX IF NOT EXISTS votes_target_user_id_idx ON votes(target_user_id);
CREATE INDEX IF NOT EXISTS votes_vote_type_idx ON votes(vote_type);
