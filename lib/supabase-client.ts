import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for server components and API routes)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Types for votes
export type VoteType = "up" | "down"

export interface Vote {
  id: string
  user_id: string
  target_user_id: string
  vote_type: VoteType
  created_at: string
  updated_at: string
}

// Function to record a vote
export async function recordVote(
  userId: string,
  targetUserId: string,
  voteType: VoteType,
): Promise<{ success: boolean; message: string; vote?: Vote }> {
  try {
    if (!userId || !targetUserId) {
      return { success: false, message: "User IDs are required" }
    }

    // Check if a vote already exists
    const { data: existingVotes, error: fetchError } = await supabase
      .from("votes")
      .select("*")
      .eq("user_id", userId)
      .eq("target_user_id", targetUserId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error fetching existing vote:", fetchError)
      return { success: false, message: "Error checking for existing vote" }
    }

    const now = new Date().toISOString()

    if (existingVotes) {
      // Update existing vote
      const { data, error } = await supabase
        .from("votes")
        .update({
          vote_type: voteType,
          updated_at: now,
        })
        .eq("id", existingVotes.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating vote:", error)
        return { success: false, message: "Error updating vote" }
      }

      return {
        success: true,
        message: "Vote updated successfully",
        vote: data as Vote,
      }
    } else {
      // Create new vote
      const { data, error } = await supabase
        .from("votes")
        .insert({
          user_id: userId,
          target_user_id: targetUserId,
          vote_type: voteType,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating vote:", error)
        return { success: false, message: "Error creating vote" }
      }

      return {
        success: true,
        message: "Vote recorded successfully",
        vote: data as Vote,
      }
    }
  } catch (error) {
    console.error("Unexpected error recording vote:", error)
    return { success: false, message: "Unexpected error recording vote" }
  }
}

// Function to get vote counts for a user
export async function getVoteCounts(userId: string): Promise<{
  upvotes: number
  downvotes: number
  success: boolean
  message: string
}> {
  try {
    // Get upvotes
    const { count: upvotes, error: upvoteError } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("target_user_id", userId)
      .eq("vote_type", "up")

    if (upvoteError) {
      console.error("Error fetching upvotes:", upvoteError)
      return {
        upvotes: 0,
        downvotes: 0,
        success: false,
        message: "Error fetching upvotes",
      }
    }

    // Get downvotes
    const { count: downvotes, error: downvoteError } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("target_user_id", userId)
      .eq("vote_type", "down")

    if (downvoteError) {
      console.error("Error fetching downvotes:", downvoteError)
      return {
        upvotes: 0,
        downvotes: 0,
        success: false,
        message: "Error fetching downvotes",
      }
    }

    return {
      upvotes: upvotes || 0,
      downvotes: downvotes || 0,
      success: true,
      message: "Vote counts fetched successfully",
    }
  } catch (error) {
    console.error("Unexpected error getting vote counts:", error)
    return {
      upvotes: 0,
      downvotes: 0,
      success: false,
      message: "Unexpected error getting vote counts",
    }
  }
}

// Function to check if a user has voted for a target
export async function getUserVote(
  userId: string,
  targetUserId: string,
): Promise<{
  hasVoted: boolean
  voteType?: VoteType
  success: boolean
  message: string
}> {
  try {
    const { data, error } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("user_id", userId)
      .eq("target_user_id", targetUserId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return {
          hasVoted: false,
          success: true,
          message: "No vote found",
        }
      }
      console.error("Error checking user vote:", error)
      return {
        hasVoted: false,
        success: false,
        message: "Error checking user vote",
      }
    }

    return {
      hasVoted: true,
      voteType: data.vote_type as VoteType,
      success: true,
      message: "Vote found",
    }
  } catch (error) {
    console.error("Unexpected error checking user vote:", error)
    return {
      hasVoted: false,
      success: false,
      message: "Unexpected error checking user vote",
    }
  }
}
