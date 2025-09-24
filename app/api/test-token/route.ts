import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Token API is accessible",
    timestamp: new Date().toISOString(),
    env: {
      hasLivekitUrl: !!process.env.LIVEKIT_URL,
      hasLivekitApiKey: !!process.env.LIVEKIT_API_KEY,
      hasLivekitApiSecret: !!process.env.LIVEKIT_API_SECRET,
      hasNextPublicLivekitUrl: !!process.env.NEXT_PUBLIC_LIVEKIT_URL,
    },
  })
}
