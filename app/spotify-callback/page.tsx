"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { parseSpotifyToken } from "@/lib/spotify-service"
import { Loader2 } from "lucide-react"

export default function SpotifyCallback() {
  const router = useRouter()

  useEffect(() => {
    const token = parseSpotifyToken()

    if (token) {
      // Token successfully parsed and saved to localStorage
      console.log("Spotify authentication successful")

      // Redirect back to the main page
      router.push("/")
    } else {
      console.error("Failed to get Spotify token")
      router.push("/?spotify_error=true")
    }
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <Loader2 className="h-12 w-12 animate-spin text-green-500" />
      <p className="mt-4 text-white">Connecting to Spotify...</p>
    </div>
  )
}
