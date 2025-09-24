"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

export default function VideoMatchmakingTest() {
  const [hasVideo, setHasVideo] = useState<boolean | null>(null)
  const [matchmakingStatus, setMatchmakingStatus] = useState<{
    status?: string
    message?: string
    roomId?: string
    error?: string
  }>({ message: "Not started" })

  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Check for camera access
  const checkCamera = async () => {
    setLoading(true)
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setHasVideo(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setHasVideo(false)
    } finally {
      setLoading(false)
    }
  }

  const startMatchmaking = async () => {
    if (!hasVideo) {
      setMatchmakingStatus({
        status: "error",
        message: "Camera access is required for matchmaking",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: `test-user-${Date.now()}`,
          hasVideo: true,
        }),
      })

      const data = await response.json()
      setMatchmakingStatus(data)
    } catch (error) {
      setMatchmakingStatus({
        status: "error",
        message: `Error in matchmaking: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setLoading(false)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Video Matchmaking Test</h1>

      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Camera Access</h2>

        <div className="mb-4">
          <Button onClick={checkCamera} disabled={loading} className="mb-4">
            {loading ? "Checking..." : "Check Camera Access"}
          </Button>

          {hasVideo !== null && (
            <div className="ml-4 inline-block">
              Camera status:
              <span className={hasVideo ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                {hasVideo ? "Available ✓" : "Not available ✗"}
              </span>
            </div>
          )}
        </div>

        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Matchmaking Test</h2>
        <Button onClick={startMatchmaking} disabled={loading || hasVideo !== true} className="mb-4">
          {loading ? "Finding match..." : "Start Matchmaking"}
        </Button>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Status:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(matchmakingStatus, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
