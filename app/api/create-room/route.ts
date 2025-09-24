import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  // Generate a unique room ID
  const roomId = uuidv4()

  return NextResponse.json({ roomId })
}
