"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SimpleCameraTestPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })

      setStream(mediaStream)
      setHasPermission(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Camera error:", err)
      setError(err instanceof Error ? err.message : "Failed to access camera")
      setHasPermission(false)
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setHasPermission(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Chat</span>
        </Link>
      </header>

      <main className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Simple Camera Test</h1>

          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={startCamera}
                  disabled={isLoading || !!stream}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  {isLoading ? "Starting..." : "Start Camera"}
                </Button>
                
                <Button
                  onClick={stopCamera}
                  disabled={!stream}
                  variant="outline"
                >
                  Stop Camera
                </Button>
              </div>

              {error && (
                <div className="bg-red-900 border border-red-700 rounded p-4">
                  <h3 className="font-bold text-red-300 mb-2">Error:</h3>
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {hasPermission === true && (
                <div className="bg-green-900 border border-green-700 rounded p-4">
                  <p className="text-green-200">✅ Camera permission granted!</p>
                </div>
              )}

              {hasPermission === false && (
                <div className="bg-yellow-900 border border-yellow-700 rounded p-4">
                  <p className="text-yellow-200">⚠️ Camera permission denied. Please allow camera access.</p>
                </div>
              )}

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-bold mb-2">Camera Preview:</h3>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-md bg-gray-700 rounded"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Camera Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 p-4 rounded">
                <h3 className="font-bold">Permission</h3>
                <p className={hasPermission === true ? "text-green-400" : hasPermission === false ? "text-red-400" : "text-gray-400"}>
                  {hasPermission === true ? "✅ Granted" : hasPermission === false ? "❌ Denied" : "❓ Unknown"}
                </p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded">
                <h3 className="font-bold">Stream</h3>
                <p className={stream ? "text-green-400" : "text-gray-400"}>
                  {stream ? "✅ Active" : "❌ Inactive"}
                </p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded">
                <h3 className="font-bold">Loading</h3>
                <p className={isLoading ? "text-yellow-400" : "text-gray-400"}>
                  {isLoading ? "⏳ Loading..." : "✅ Ready"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
