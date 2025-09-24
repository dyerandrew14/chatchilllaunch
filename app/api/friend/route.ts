import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, friendUsername } = body

    if (!userId || !friendUsername) {
      return NextResponse.json({ success: false, error: "User ID and friend username are required" }, { status: 400 })
    }

    // In a real app, this would store the friend request in a database
    console.log(`Friend request from user ${userId} to ${friendUsername}`)

    return NextResponse.json({
      success: true,
      message: "Friend request sent successfully",
    })
  } catch (error) {
    console.error("Error in friend API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
