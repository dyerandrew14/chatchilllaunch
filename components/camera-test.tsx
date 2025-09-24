"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CameraView } from "./camera-view"
import { createLocalVideoTrack } from "@livekit/components-core"
import type { LocalVideoTrack } from "livekit-client"

export function CameraTest() {
  const [cameraActive, setCameraActive] = useState(false)
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize or cleanup video track when cameraActive changes
  useEffect(() => {
    let mounted = true

    const initializeCamera = async () => {
      if (cameraActive) {
        try {
          setIsLoading(true)
          setError(null)

          console.log("Initializing camera...")
          const track = await createLocalVideoTrack({
            resolution: { width: 640, height: 480 },
          })

          if (mounted) {
            console.log("Camera initialized successfully")
            setVideoTrack(track)
            setIsLoading(false)
          } else {
            // Component unmounted before track was created, clean up
            track.stop()
          }
        } catch (err) {
          console.error("Error initializing camera:", err)
          if (mounted) {
            setError(err instanceof Error ? err.message : "Failed to initialize camera")
            setIsLoading(false)
            setCameraActive(false)
          }
        }
      } else if (videoTrack) {
        // Clean up video track when camera is toggled off
        console.log("Stopping camera...")
        videoTrack.stop()
        setVideoTrack(null)
      }
    }

    initializeCamera()

    // Cleanup function
    return () => {
      mounted = false
      if (videoTrack) {
        console.log("Cleaning up video track on unmount")
        videoTrack.stop()
      }
    }
  }, [cameraActive])

  const toggleCamera = () => {
    setCameraActive(!cameraActive)
  }

  return (
    <div className="flex flex-col items-center p-4 gap-4">
      <h2 className="text-xl font-bold">Camera Test</h2>

      <div className="w-full max-w-md h-80 bg-gray-900 rounded-lg overflow-hidden">
        <CameraView
          isLocal={true}
          username="Test User"
          countryFlag="🇺🇸"
          isActive={cameraActive && !!videoTrack}
          videoTrack={videoTrack}
        />
      </div>

      <Button onClick={toggleCamera} className="bg-yellow-500 text-black hover:bg-yellow-600" disabled={isLoading}>
        {isLoading ? "Initializing..." : cameraActive ? "Stop Camera" : "Start Camera"}
      </Button>

      {error && <div className="text-red-500 text-sm mt-2">Error: {error}</div>}

      <div className="text-sm text-gray-400 mt-4">
        <p>If you can't see your camera:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Make sure you've granted camera permissions in your browser</li>
          <li>Try refreshing the page</li>
          <li>Check if another application is using your camera</li>
          <li>Try a different browser</li>
        </ul>
      </div>
    </div>
  )
}
