import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Create a Supabase client for the route handler with cookies
    const supabase = createRouteHandlerClient({ cookies })

    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If there's no session, return unauthorized
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required", message: "You must be logged in to use matchmaking." },
        { status: 401 },
      )
    }

    // Parse the request body
    const body = await request.json()
    const { hasVideo } = body

    // Get the current user's ID
    const userId = session.user.id

    // First, check if there's already a waiting user with matching interests
    const { data: matchData, error: matchError } = await supabase
      .from("matchmaking")
      .select("*")
      .eq("status", "waiting")
      .neq("user_id", userId) // Don't match with self
      .limit(1)

    if (matchError) {
      console.error("Error querying matchmaking table:", matchError)
      return NextResponse.json({ error: "Database error", message: "Failed to search for matches." }, { status: 500 })
    }

    // Generate a unique room ID
    const roomId = `room_${Math.random().toString(36).substring(2, 15)}`

    if (matchData && matchData.length > 0) {
      // Found a match! Update the matched user's status
      const matchedUser = matchData[0]

      // Update the matched user's record
      const { error: updateMatchedUserError } = await supabase
        .from("matchmaking")
        .update({
          status: "matched",
          matched_at: new Date().toISOString(),
          matched_with: userId,
          room_id: roomId,
          has_video: matchedUser.has_video || false,
        })
        .eq("user_id", matchedUser.user_id)

      if (updateMatchedUserError) {
        console.error("Error updating matched user:", updateMatchedUserError)
        return NextResponse.json(
          { error: "Database error", message: "Failed to update match status." },
          { status: 500 },
        )
      }

      // First, clean up any existing entries for the current user
      const { error: deleteError } = await supabase.from("matchmaking").delete().eq("user_id", userId)

      if (deleteError) {
        console.error("Error cleaning up existing entries:", deleteError)
        // Continue anyway, as the user might not have any existing entries
      }

      // Insert a record for the current user
      const { error: insertCurrentUserError } = await supabase.from("matchmaking").insert({
        user_id: userId,
        status: "matched",
        matched_at: new Date().toISOString(),
        matched_with: matchedUser.user_id,
        room_id: roomId,
        has_video: hasVideo || false,
      })

      if (insertCurrentUserError) {
        console.error("Error inserting current user match:", insertCurrentUserError)
        return NextResponse.json({ error: "Database error", message: "Failed to record match." }, { status: 500 })
      }

      return NextResponse.json({
        status: "matched",
        roomId,
        matchedUserId: matchedUser.user_id,
        message: "Successfully matched with another user",
        shouldJoinRoom: true,
      })
    } else {
      // No match found, add current user to waiting pool

      // First, clean up any existing entries for this user
      const { error: deleteError } = await supabase.from("matchmaking").delete().eq("user_id", userId)

      if (deleteError) {
        console.error("Error cleaning up existing entries:", deleteError)
        // Continue anyway, as the user might not have any existing entries
      }

      // Insert a new waiting record
      const { error: insertError } = await supabase.from("matchmaking").insert({
        user_id: userId,
        status: "waiting",
        has_video: hasVideo || false,
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error inserting waiting user:", insertError)
        return NextResponse.json(
          { error: "Database error", message: "Failed to enter matchmaking pool." },
          { status: 500 },
        )
      }

      return NextResponse.json({
        status: "waiting",
        message: "Added to matchmaking pool. Waiting for a match.",
      })
    }
  } catch (error) {
    console.error("Error in match API:", error)
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to process matchmaking request" },
      { status: 500 },
    )
  }
}
