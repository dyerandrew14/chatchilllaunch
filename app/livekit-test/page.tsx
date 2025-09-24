"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useLiveKit } from "@/hooks/use-livekit"
import { ConnectionStatus } from "@/components/connection-status"
import { Input } from "@/components/ui/input"

export default function LiveKitTest() {
  const [token, setToken] = useState<string>("")
  const [roomName, setRoomName] = useState<string>("test-room")
  const [message, setMessage] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)

  const {
    connect,
    disconnect,
    isConnected,
    connectionState,
    error,
    localParticipant,
    remoteParticipants,
    publishCamera,
    toggleCamera,
    toggleMicrophone,
    isCameraEnabled,
    isMicrophoneEnabled,
  } = useLiveKit()

  const getToken = async () => {
    try {
      const response = await fetch(`/api/token?room=${roomName}`)
      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.status}`)
      }
      const data = await response.json()
      setToken(data.token)
    } catch (err) {
      console.error("Error getting token:", err)
    }
  }

  const handleConnect = async () => {
    if (!token) {
      await getToken()
    }
    connect(token, roomName)
  }

  const handlePublishCamera = async () => {
    await publishCamera()
  }

  useEffect(() => {
    // Attach local participant's video track to video element when available
    if (localParticipant && videoRef.current) {
      const videoTracks = localParticipant
        .getTrackPublications()
        .filter((pub) => pub.kind === "video" && pub.isSubscribed && pub.track)

      if (videoTracks.length > 0 && videoTracks[0].track) {
        videoTracks[0].track.attach(videoRef.current)
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [localParticipant])

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-2xl font-bold">LiveKit Connection Test</h1>

      <div className="mb-6 grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Room Name</label>
          <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} className="mb-2" />
        </div>

        <div className="flex gap-2">
          <Button onClick={getToken} disabled={isConnected}>
            Get Token
          </Button>

          <Button onClick={handleConnect} disabled={isConnected || !token}>
            Connect
          </Button>

          <Button onClick={disconnect} disabled={!isConnected} variant="destructive">
            Disconnect
          </Button>
        </div>
      </div>

      {token && (
        <div className="mb-6 overflow-hidden rounded-md bg-gray-100 p-4">
          <p className="mb-2 font-bold">Token:</p>
          <p className="break-all text-xs">{token}</p>
        </div>
      )}

      <div className="mb-6">
        <ConnectionStatus connectionState={connectionState} />

        {error && (
          <div className="mt-4 rounded-md bg-red-100 p-4 text-red-700">
            <p className="font-bold">Error:</p>
            <p>{error.message}</p>
          </div>
        )}
      </div>

      {isConnected && (
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold">Media Controls</h2>

          <div className="flex gap-2 mb-4">
            <Button onClick={handlePublishCamera}>Publish Camera</Button>

            <Button onClick={toggleCamera} variant={isCameraEnabled ? "default" : "outline"}>
              {isCameraEnabled ? "Disable Camera" : "Enable Camera"}
            </Button>

            <Button onClick={toggleMicrophone} variant={isMicrophoneEnabled ? "default" : "outline"}>
              {isMicrophoneEnabled ? "Mute Mic" : "Unmute Mic"}
            </Button>
          </div>

          <div className="aspect-video bg-gray-900 rounded-md overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          </div>
        </div>
      )}

      {isConnected && remoteParticipants.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold">Remote Participants ({remoteParticipants.length})</h2>

          <ul className="grid gap-2">
            {remoteParticipants.map((participant) => (
              <li key={participant.sid} className="rounded-md bg-gray-100 p-4">
                <p className="font-bold">{participant.identity}</p>
                <p className="text-sm text-gray-600">{participant.getTrackPublications().length} tracks published</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
