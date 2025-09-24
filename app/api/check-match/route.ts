import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
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
        { error: "Authentication required", message: "You must be logged in to check matches." },
        { status: 401 },
      )
    }

    // Get the current user's ID
    const userId = session.user.id

    // Check if the user has been matched
    const { data: matchData, error: matchError } = await supabase
      .from("matchmaking")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "matched")
      .order("matched_at", { ascending: false })
      .limit(1)
      .single()

    if (matchError) {
      // If no match found, return waiting status
      if (matchError.code === "PGRST116") {
        return NextResponse.json({
          status: "waiting",
          message: "Still waiting for a match.",
        })
      }

      console.error("Error checking match status:", matchError)
      return NextResponse.json({ error: "Database error", message: "Failed to check match status." }, { status: 500 })
    }

    // If we found a match, return the room ID
    return NextResponse.json({
      status: "matched",
      roomId: matchData.room_id,
      message: "You have been matched with another user.",
    })
  } catch (error) {
    console.error("Error in check-match API:", error)
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to check match status" },
      { status: 500 },
    )
  }
}
