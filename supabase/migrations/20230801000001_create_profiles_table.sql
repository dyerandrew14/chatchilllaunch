-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    country TEXT,
    bio TEXT,
    instagram TEXT,
    snapchat TEXT,
    facebook TEXT,
    discord TEXT,
    is_vip BOOLEAN DEFAULT FALSE,
    subscription_date TIMESTAMP WITH TIME ZONE
);

-- Create RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Allow users to read all profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);
