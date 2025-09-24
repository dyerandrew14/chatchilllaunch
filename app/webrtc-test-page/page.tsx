"use client"

import { useState, useEffect } from "react"
import { WebRTCCameraView } from "@/components/webrtc-camera-view"
import { Button } from "@/components/ui/button"

export default function WebRTCTestPage() {
  const [roomId, setRoomId] = useState("")
  const [userId, setUserId] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [showLocalVideo, setShowLocalVideo] = useState(false)
  const [showRemoteVideo, setShowRemoteVideo] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("Not connected")

  // Generate random IDs on component mount
  useEffect(() => {
    setRoomId(`room-${Math.floor(Math.random() * 1000000)}`)
    setUserId(`user-${Math.floor(Math.random() * 1000000)}`)
  }, [])

  const handleStartLocalVideo = () => {
    setShowLocalVideo(true)
  }

  const handleJoinRoom = () => {
    setShowRemoteVideo(true)
  }

  const handleConnected = () => {
    setIsConnected(true)
    setConnectionStatus("Connected")
  }

  const handleDisconnected = () => {
    setIsConnected(false)
    setConnectionStatus("Disconnected")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WebRTC Connection Test</h1>

      <div className="mb-4 p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Connection Info</h2>
        <p>
          <strong>Room ID:</strong> {roomId}
        </p>
        <p>
          <strong>User ID:</strong> {userId}
        </p>
        <p>
          <strong>Status:</strong> {connectionStatus}
        </p>
        <p>
          <strong>Signaling Server:</strong> {process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || "Not configured"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Local Video</h2>
          {!showLocalVideo ? (
            <Button onClick={handleStartLocalVideo} className="mb-4">
              Start Local Video
            </Button>
          ) : (
            <div className="h-80 bg-gray-900 rounded-md overflow-hidden">
              <WebRTCCameraView
                isLocal={true}
                username="You"
                isActive={showLocalVideo}
                userId={userId}
                roomId={roomId}
                onConnected={handleConnected}
                onDisconnected={handleDisconnected}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Remote Video</h2>
          {!showRemoteVideo ? (
            <Button onClick={handleJoinRoom} className="mb-4" disabled={!showLocalVideo}>
              Join Room
            </Button>
          ) : (
            <div className="h-80 bg-gray-900 rounded-md overflow-hidden">
              <WebRTCCameraView
                isLocal={false}
                username="Remote User"
                isActive={showRemoteVideo}
                userId={`remote-${userId}`}
                roomId={roomId}
                onConnected={handleConnected}
                onDisconnected={handleDisconnected}
              />
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Testing Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Open this page in two different browsers or devices</li>
          <li>Click "Start Local Video" on both to initialize camera</li>
          <li>Use the same Room ID on both (copy it from this page)</li>
          <li>Click "Join Room" on both to establish connection</li>
          <li>You should see the remote video appear if connection is successful</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Check browser console for WebRTC errors</li>
          <li>Verify that your signaling server is running and accessible</li>
          <li>Make sure your TURN server is configured correctly</li>
          <li>Try using a different network if you're behind a restrictive firewall</li>
        </ul>
      </div>
    </div>
  )
}
