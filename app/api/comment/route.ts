import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, message } = body

    if (!userId || !message) {
      return NextResponse.json({ success: false, error: "User ID and message are required" }, { status: 400 })
    }

    // In a real app, this would store the message in a database
    console.log(`Message from user ${userId}: ${message}`)

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    })
  } catch (error) {
    console.error("Error in comment API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
