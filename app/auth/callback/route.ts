import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")

  // If there's an error, redirect to home with error params
  if (error) {
    console.error("Auth error:", error, error_description)
    return NextResponse.redirect(
      `${requestUrl.origin}?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(
        error_description || "",
      )}`,
    )
  }

  // If there's no code, redirect to home
  if (!code) {
    return NextResponse.redirect(requestUrl.origin)
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
  } catch (error) {
    console.error("Error exchanging code for session:", error)
    return NextResponse.redirect(
      `${requestUrl.origin}?error=session_error&error_description=${encodeURIComponent(
        "Failed to complete authentication",
      )}`,
    )
  }

  // Redirect to the home page
  return NextResponse.redirect(requestUrl.origin)
}
