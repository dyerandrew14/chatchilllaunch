"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Room, RoomEvent, type RemoteParticipant, Track, ConnectionState } from "livekit-client"

type CameraViewProps = {
  isLocal: boolean
  username: string
  countryFlag?: string
  isActive: boolean
  profileImage?: string
  onProfileClick?: () => void
  token?: string
  roomName?: string
  onVideoPublished?: (published: boolean) => void
}

export function CameraView({
  isLocal,
  username,
  countryFlag,
  isActive,
  profileImage,
  onProfileClick,
  token,
  roomName,
  onVideoPublished,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected)

  useEffect(() => {
    // Only connect if the component is active and we have a token (for remote participants)
    // or if it's the local participant (which will use local camera without connecting to LiveKit)
    if (isActive) {
      if (isLocal) {
        // For local participant, just get local camera
        setupLocalCamera()
      } else if (token && roomName) {
        // For remote participants, connect to LiveKit
        connectToLiveKit()
      }
    }

    // Cleanup function
    return () => {
      if (room) {
        room.disconnect()
      }
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream | null
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
          videoRef.current.srcObject = null
        }
      }
    }
  }, [isActive, isLocal, token, roomName])

  const setupLocalCamera = async () => {
    try {
      setIsConnecting(true)
      setError(null)

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      // Display local video
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch((error) => console.error("Error playing video:", error))
      }

      setIsConnected(true)
      setIsConnecting(false)

      // Report successful video publishing
      if (onVideoPublished) {
        onVideoPublished(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Failed to access camera. Please check your permissions.")
      setIsConnecting(false)

      // Report failed video publishing
      if (onVideoPublished) {
        onVideoPublished(false)
      }
    }
  }

  const connectToLiveKit = async () => {
    if (!token || !roomName) {
      setError("Missing token or room name")
      if (onVideoPublished) {
        onVideoPublished(false)
      }
      return
    }

    try {
      setIsConnecting(true)
      setError(null)

      // Create a new room
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      })

      // Set up event listeners
      newRoom.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log("Participant connected", participant.identity)
      })

      newRoom.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        console.log("Participant disconnected", participant.identity)
      })

      newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log("Track subscribed", track.kind, participant.identity)

        if (track.kind === "video" && videoRef.current) {
          // Attach video track to video element
          track.attach(videoRef.current)
        }
      })

      newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
        console.log("Track unsubscribed", track.kind)
        track.detach()
      })

      newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        console.log("Connection state changed", state)
        setConnectionState(state)

        if (state === ConnectionState.Connected) {
          setIsConnected(true)
          setIsConnecting(false)
        } else if (state === ConnectionState.Disconnected) {
          setIsConnected(false)
        }
      })

      // Connect to the room
      await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://chatchill-9vbxm2k6.livekit.cloud", token)
      setRoom(newRoom)

      // If this is a local participant, publish tracks
      if (isLocal && newRoom.localParticipant) {
        try {
          const tracks = await newRoom.localParticipant.createCameraAndMicrophoneTracks()

          // Publish tracks
          await Promise.all(tracks.map((track) => newRoom.localParticipant.publishTrack(track)))

          // Attach local video to video element
          const videoTrack = tracks.find((track) => track.kind === Track.Kind.Video)
          if (videoTrack && videoRef.current) {
            videoTrack.attach(videoRef.current)

            // Report successful video publishing
            if (onVideoPublished) {
              onVideoPublished(true)
            }
          } else {
            // No video track found
            if (onVideoPublished) {
              onVideoPublished(false)
            }
          }
        } catch (trackError) {
          console.error("Error publishing tracks:", trackError)
          if (onVideoPublished) {
            onVideoPublished(false)
          }
        }
      }
    } catch (err) {
      console.error("Error connecting to LiveKit:", err)
      setError("Failed to connect. Please try again.")
      setIsConnecting(false)

      // Report failed video publishing
      if (onVideoPublished) {
        onVideoPublished(false)
      }
    }
  }

  return (
    <div className="relative h-full bg-gray-900 overflow-hidden">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Mute local video to prevent feedback
        className={cn("h-full w-full object-cover", !isActive && "hidden", isConnecting && "opacity-50")}
      />

      {/* Connection state indicator */}
      {connectionState !== ConnectionState.Connected && connectionState !== ConnectionState.Disconnected && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-black text-xs rounded-md">
          {connectionState === ConnectionState.Connecting
            ? "Connecting..."
            : connectionState === ConnectionState.Reconnecting
              ? "Reconnecting..."
              : ""}
        </div>
      )}

      {/* Loading overlay */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-yellow-500"></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="max-w-md rounded-lg bg-red-900/80 p-4 text-center text-white">
            <p className="mb-2 text-lg font-bold">Camera Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Inactive state */}
      {!isActive && !isConnecting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-800">
            {profileImage ? (
              <img src={profileImage || "/placeholder.svg"} alt={username} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-gray-400">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="mt-4 text-lg font-medium text-gray-300">{username}</p>
          {countryFlag && <p className="mt-1 text-2xl">{countryFlag}</p>}
        </div>
      )}

      {/* User info overlay */}
      {isActive && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4",
            isLocal ? "cursor-default" : "cursor-pointer",
          )}
          onClick={!isLocal ? onProfileClick : undefined}
        >
          <div className="flex items-center">
            <div className="mr-2 h-8 w-8 overflow-hidden rounded-full bg-gray-800">
              {profileImage ? (
                <img src={profileImage || "/placeholder.svg"} alt={username} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-300">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-white">{username}</p>
              {countryFlag && (
                <p className="flex items-center text-sm text-gray-300">
                  <span className="mr-1">{countryFlag}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
