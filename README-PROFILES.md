# ChatChill Profiles Setup

This document explains how to set up the profiles table in Supabase for ChatChill.

## Database Schema

The profiles table has the following schema:

\`\`\`sql
CREATE TABLE public.profiles (
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
\`\`\`

## Row Level Security (RLS) Policies

The following RLS policies are applied to the profiles table:

1. Allow users to read all profiles
2. Allow users to update their own profile
3. Allow users to insert their own profile

## Automatic Profile Creation

When a user signs up, a profile is automatically created for them with the following default values:

- `id`: The user's UUID from auth.users
- `username`: The part of the user's email before the @ symbol
- `avatar_url`: null
- `created_at`: Current timestamp
- `updated_at`: Current timestamp
- All other fields: null or default values

## Manual Setup

If you need to set up the profiles table manually, you can run the SQL migrations in the following order:

1. `20230801000001_create_profiles_table.sql`
2. `20230801000002_fix_profiles_table.sql`

## Troubleshooting

If you encounter issues with profiles not being created automatically, check the following:

1. Ensure the RLS policies are correctly set up
2. Check the Supabase logs for any errors during profile creation
3. Verify that the auth.users table contains the user's record
