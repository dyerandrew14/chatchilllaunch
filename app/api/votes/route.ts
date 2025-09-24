import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { targetUserId, voteType } = body

    if (!targetUserId || !voteType) {
      return NextResponse.json(
        { success: false, message: "Target user ID and vote type are required" },
        { status: 400 },
      )
    }

    // Validate vote type
    if (voteType !== "up" && voteType !== "down") {
      return NextResponse.json(
        { success: false, message: 'Invalid vote type. Must be "up" or "down"' },
        { status: 400 },
      )
    }

    // Check if a vote already exists
    const { data: existingVote, error: fetchError } = await supabase
      .from("votes")
      .select("*")
      .eq("user_id", user.id)
      .eq("target_user_id", targetUserId)
      .single()

    const now = new Date().toISOString()

    if (existingVote) {
      // Update existing vote
      const { data, error } = await supabase
        .from("votes")
        .update({
          vote_type: voteType,
          updated_at: now,
        })
        .eq("id", existingVote.id)
        .select()

      if (error) {
        console.error("Error updating vote:", error)
        return NextResponse.json({ success: false, message: "Error updating vote" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Vote updated successfully",
        vote: data[0],
      })
    } else {
      // Create new vote
      const { data, error } = await supabase
        .from("votes")
        .insert({
          user_id: user.id,
          target_user_id: targetUserId,
          vote_type: voteType,
          created_at: now,
          updated_at: now,
        })
        .select()

      if (error) {
        console.error("Error creating vote:", error)
        return NextResponse.json({ success: false, message: "Error creating vote" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Vote recorded successfully",
        vote: data[0],
      })
    }
  } catch (error) {
    console.error("Unexpected error processing vote:", error)
    return NextResponse.json({ success: false, message: "Unexpected error processing vote" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Get URL parameters
    const url = new URL(request.url)
    const targetUserId = url.searchParams.get("targetUserId")

    if (!targetUserId) {
      return NextResponse.json({ success: false, message: "Target user ID is required" }, { status: 400 })
    }

    // Get user's vote for the target
    const { data, error } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("user_id", user.id)
      .eq("target_user_id", targetUserId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json({
          success: true,
          hasVoted: false,
          message: "No vote found",
        })
      }

      console.error("Error fetching vote:", error)
      return NextResponse.json({ success: false, message: "Error fetching vote" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      hasVoted: true,
      voteType: data.vote_type,
      message: "Vote found",
    })
  } catch (error) {
    console.error("Unexpected error fetching vote:", error)
    return NextResponse.json({ success: false, message: "Unexpected error fetching vote" }, { status: 500 })
  }
}
