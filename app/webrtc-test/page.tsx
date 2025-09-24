"use client"

import { useState, useEffect, useCallback } from "react"
import { WebRTCCameraView } from "@/components/webrtc-camera-view"
import { WebRTCControls } from "@/components/webrtc-controls"
import { WebRTCConnectionStatus } from "@/components/webrtc-connection-status"
import { WebRTCDiagnostics } from "@/components/webrtc-diagnostics"
import { Button } from "@/components/ui/button"

export default function WebRTCTestPage() {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [userId] = useState(`user-${Math.floor(Math.random() * 1000000)}`)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasPublishedVideo, setHasPublishedVideo] = useState(false)

  const createRoom = useCallback(async () => {
    try {
      const response = await fetch("/api/create-room")
      const data = await response.json()
      setRoomId(data.roomId)
      console.log("Created room:", data.roomId)
    } catch (error) {
      console.error("Error creating room:", error)
      setHasError(true)
      setErrorMessage("Failed to create room")
    }
  }, [])

  const handleJoinRoom = useCallback(async () => {
    const roomIdInput = prompt("Enter room ID to join:")
    if (roomIdInput) {
      setRoomId(roomIdInput)
    }
  }, [])

  const handleRetry = useCallback(() => {
    setHasError(false)
    setErrorMessage(null)
    createRoom()
  }, [createRoom])

  useEffect(() => {
    createRoom()
  }, [createRoom])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">WebRTC Test</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="aspect-video">
                <WebRTCCameraView
                  isLocal={true}
                  username="You"
                  isActive={true}
                  userId={userId}
                  roomId={roomId || undefined}
                  onVideoPublished={(published) => {
                    setHasPublishedVideo(published)
                  }}
                  onConnected={() => {
                    setIsConnected(true)
                    setIsConnecting(false)
                    setHasError(false)
                  }}
                  onDisconnected={() => {
                    setIsConnected(false)
                  }}
                />
              </div>
              <div className="p-4 flex justify-between items-center">
                <WebRTCConnectionStatus isConnected={isConnected} isConnecting={isConnecting} hasError={hasError} />
                <WebRTCControls
                  onToggleAudio={(enabled) => {
                    console.log("Toggle audio:", enabled)
                  }}
                  onToggleVideo={(enabled) => {
                    console.log("Toggle video:", enabled)
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-2">Room Information</h2>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <span>Room ID:</span>
                  <span className="font-mono">{roomId || "Not connected"}</span>
                </div>
                <div className="flex justify-between">
                  <span>User ID:</span>
                  <span className="font-mono">{userId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Video Published:</span>
                  <span>{hasPublishedVideo ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Connection Status:</span>
                  <span>
                    {isConnecting ? "Connecting..." : isConnected ? "Connected" : hasError ? "Error" : "Disconnected"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button onClick={createRoom} className="flex-1">
                  Create New Room
                </Button>
                <Button onClick={handleJoinRoom} className="flex-1">
                  Join Room
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <WebRTCDiagnostics
              isConnected={isConnected}
              isConnecting={isConnecting}
              hasError={hasError}
              onRetry={handleRetry}
            />

            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-2">How to Test</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Create a room or join an existing one</li>
                <li>Open this page in another browser or device</li>
                <li>Join the same room ID</li>
                <li>You should see the video connection established</li>
              </ol>
            </div>

            {errorMessage && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                <h2 className="text-lg font-medium mb-2">Error</h2>
                <p>{errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
