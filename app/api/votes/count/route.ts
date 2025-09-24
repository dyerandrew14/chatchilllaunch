import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Get URL parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    // Get upvotes
    const { count: upvotes, error: upvoteError } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("target_user_id", userId)
      .eq("vote_type", "up")

    if (upvoteError) {
      console.error("Error fetching upvotes:", upvoteError)
      return NextResponse.json({ success: false, message: "Error fetching upvotes" }, { status: 500 })
    }

    // Get downvotes
    const { count: downvotes, error: downvoteError } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("target_user_id", userId)
      .eq("vote_type", "down")

    if (downvoteError) {
      console.error("Error fetching downvotes:", downvoteError)
      return NextResponse.json({ success: false, message: "Error fetching downvotes" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      upvotes: upvotes || 0,
      downvotes: downvotes || 0,
      message: "Vote counts fetched successfully",
    })
  } catch (error) {
    console.error("Unexpected error fetching vote counts:", error)
    return NextResponse.json({ success: false, message: "Unexpected error fetching vote counts" }, { status: 500 })
  }
}
