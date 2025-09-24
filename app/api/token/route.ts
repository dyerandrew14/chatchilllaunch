import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

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
        { error: "Authentication required", message: "You must be logged in to get a token." },
        { status: 401 },
      )
    }

    // Get the room from the query string
    const { searchParams } = new URL(request.url)
    const room = searchParams.get("room")

    if (!room) {
      return NextResponse.json({ error: "Missing parameter", message: "Room parameter is required." }, { status: 400 })
    }

    // Get the user's ID and username
    const userId = session.user.id
    const username = session.user.email?.split("@")[0] || "User"

    // Create a token with the user's identity
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Server configuration error", message: "LiveKit API credentials are not configured." },
        { status: 500 },
      )
    }

    // Create a token with the user's identity
    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: username,
    })

    // Grant permissions to the room
    at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true })

    // Generate the token
    const token = at.toJwt()

    // Return the token
    return NextResponse.json({
      token,
      identity: username,
      userId,
    })
  } catch (error) {
    console.error("Error generating token:", error)
    return NextResponse.json({ error: "Internal server error", message: "Failed to generate token" }, { status: 500 })
  }
}
