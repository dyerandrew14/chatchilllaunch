"use client"

import { useState, useEffect } from "react"
import { WebRTCVideoChat } from "@/components/webrtc-video-chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check } from "lucide-react"

export default function WebRTCExamplePage() {
  const [roomId, setRoomId] = useState("")
  const [userId, setUserId] = useState("")
  const [copied, setCopied] = useState(false)
  const [signalingServerUrl, setSignalingServerUrl] = useState("wss://your-signaling-server.com")

  // Generate a random user ID on mount
  useEffect(() => {
    setUserId(`user-${Math.random().toString(36).substring(2, 9)}`)
  }, [])

  // Create a new room
  const createRoom = async () => {
    try {
      const response = await fetch("/api/create-room")
      const data = await response.json()
      setRoomId(data.roomId)
    } catch (error) {
      console.error("Failed to create room:", error)
    }
  }

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">WebRTC Video Chat Example</h1>

      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Room Setup</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Room ID</label>
            <div className="flex">
              <Input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID or create a new one"
                className="flex-1"
              />
              <Button onClick={copyRoomId} disabled={!roomId} className="ml-2" variant="outline">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={createRoom} className="md:self-end">
            Create New Room
          </Button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Signaling Server URL</label>
          <Input
            value={signalingServerUrl}
            onChange={(e) => setSignalingServerUrl(e.target.value)}
            placeholder="wss://your-signaling-server.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Your User ID</label>
          <Input value={userId} readOnly className="bg-gray-700" />
          <p className="text-xs text-gray-400 mt-1">This is your unique identifier for this session</p>
        </div>
      </div>

      {roomId ? (
        <WebRTCVideoChat
          roomId={roomId}
          userId={userId}
          signalingServerUrl={signalingServerUrl}
          onConnected={() => console.log("Connected to peer")}
          onDisconnected={() => console.log("Disconnected from peer")}
          onError={(error) => console.error("WebRTC error:", error)}
          className="mb-6"
        />
      ) : (
        <div className="p-8 bg-gray-800 rounded-lg text-center">
          <p className="text-gray-400">Create or enter a room ID to start video chat</p>
        </div>
      )}

      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-500">
        <h3 className="font-medium mb-2">How to use this example:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Create a new room or enter an existing room ID</li>
          <li>Share the room ID with someone else</li>
          <li>Both users should enter the same room ID</li>
          <li>Click "Start Video Chat" to connect</li>
          <li>You should see each other's video feeds</li>
        </ol>
        <p className="mt-2 text-sm">
          Note: You need a signaling server to relay WebRTC connection information between peers. Replace the signaling
          server URL with your own server.
        </p>
      </div>
    </div>
  )
}
