import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  created_at?: string
  updated_at?: string
  country?: string
  bio?: string
  instagram?: string
  snapchat?: string
  facebook?: string
  discord?: string
  is_vip?: boolean
  subscription_date?: string
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = createClientComponentClient()

  try {
    console.log("Fetching profile for user:", userId)
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      // If no profile found, return null (we'll create one)
      if (error.code === "PGRST116") {
        console.log("No profile found for user:", userId)
        return null
      }

      console.error("Error fetching profile:", error)
      throw error
    }

    return data as Profile
  } catch (error) {
    console.error("Unexpected error fetching profile:", error)
    return null
  }
}

export async function createUserProfile(userId: string, email?: string): Promise<Profile | null> {
  const supabase = createClientComponentClient()

  try {
    // Generate a username from email or use a default
    const username = email ? email.split("@")[0] : `user_${Math.floor(Math.random() * 10000)}`
    const timestamp = new Date().toISOString()

    // First check if profile already exists to avoid duplicates
    const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()

    if (existingProfile) {
      console.log("Profile already exists, returning existing profile")
      return existingProfile as Profile
    }

    console.log("Creating new profile for user:", userId, "with username:", username)

    // Create new profile
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username,
        avatar_url: null,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating profile:", error)

      // If error is due to profile already existing, try to fetch it
      if (error.code === "23505") {
        // Unique violation
        console.log("Profile already exists (race condition), fetching existing profile")
        return await getUserProfile(userId)
      }

      throw error
    }

    console.log("Profile created successfully:", data)
    return data as Profile
  } catch (error) {
    console.error("Unexpected error creating profile:", error)

    // As a last resort, try to fetch the profile one more time
    try {
      return await getUserProfile(userId)
    } catch (e) {
      console.error("Failed to fetch profile after creation error:", e)
      return null
    }
  }
}

export async function updateUserProfile(profile: Partial<Profile> & { id: string }): Promise<Profile | null> {
  const supabase = createClientComponentClient()

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      throw error
    }

    return data as Profile
  } catch (error) {
    console.error("Unexpected error updating profile:", error)
    return null
  }
}
