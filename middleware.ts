import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedPaths = ["/api/token", "/api/match", "/api/check-match"]

  // Check if the current path is in the protected paths
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session and trying to access protected route, return 401
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", message: "Authentication required" }, { status: 401 })
    }
  }

  // Continue with the request
  return res
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/api/token/:path*", "/api/match/:path*", "/api/check-match/:path*", "/profile/:path*"],
}
