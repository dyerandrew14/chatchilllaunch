"use client"

import { useState, useEffect, useRef } from "react"
import {
  type Room,
  RoomEvent,
  ConnectionState,
  LocalParticipant,
  type RemoteParticipant,
  Track,
  type TrackPublication,
} from "livekit-client"
import { createRoom, getLiveKitUrl, setupRoomEventListeners } from "@/lib/livekit-utils"

type UseLiveKitOptions = {
  autoConnect?: boolean
  roomOptions?: any
}

type UseLiveKitReturn = {
  room: Room | null
  connect: (token: string, roomName?: string) => Promise<void>
  disconnect: () => void
  isConnected: boolean
  connectionState: ConnectionState
  error: Error | null
  localParticipant: LocalParticipant | null
  remoteParticipants: RemoteParticipant[]
  publishCamera: () => Promise<void>
  publishMicrophone: () => Promise<void>
  unpublishTrack: (trackSid: string) => Promise<void>
  toggleCamera: () => Promise<void>
  toggleMicrophone: () => Promise<void>
  isCameraEnabled: boolean
  isMicrophoneEnabled: boolean
}

export function useLiveKit(token?: string, options?: UseLiveKitOptions): UseLiveKitReturn {
  const [room, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected)
  const [error, setError] = useState<Error | null>(null)
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([])
  const [isCameraEnabled, setIsCameraEnabled] = useState(false)
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false)

  const cameraTrackRef = useRef<TrackPublication | null>(null)
  const microphoneTrackRef = useRef<TrackPublication | null>(null)

  // Initialize room
  useEffect(() => {
    const newRoom = createRoom(options?.roomOptions)
    setRoom(newRoom)

    setupRoomEventListeners(newRoom, {
      onConnected: () => {
        setIsConnected(true)
        setError(null)
      },
      onDisconnected: () => {
        setIsConnected(false)
        setRemoteParticipants([])
      },
      onConnectionStateChanged: (state) => {
        setConnectionState(state)
      },
      onParticipantConnected: (participant) => {
        setRemoteParticipants((prev) => [...prev, participant])
      },
      onParticipantDisconnected: (participant) => {
        setRemoteParticipants((prev) => prev.filter((p) => p.sid !== participant.sid))
      },
    })

    // Track publications and subscriptions
    newRoom.on(RoomEvent.TrackPublished, (publication, participant) => {
      if (participant instanceof LocalParticipant) {
        if (publication.kind === Track.Kind.Video) {
          cameraTrackRef.current = publication
          setIsCameraEnabled(true)
        } else if (publication.kind === Track.Kind.Audio) {
          microphoneTrackRef.current = publication
          setIsMicrophoneEnabled(true)
        }
      }
    })

    newRoom.on(RoomEvent.TrackUnpublished, (publication) => {
      if (publication.kind === Track.Kind.Video && cameraTrackRef.current?.trackSid === publication.trackSid) {
        cameraTrackRef.current = null
        setIsCameraEnabled(false)
      } else if (
        publication.kind === Track.Kind.Audio &&
        microphoneTrackRef.current?.trackSid === publication.trackSid
      ) {
        microphoneTrackRef.current = null
        setIsMicrophoneEnabled(false)
      }
    })

    // Auto-connect if token is provided and autoConnect is true
    if (token && options?.autoConnect) {
      connect(token)
    }

    return () => {
      if (newRoom) {
        newRoom.disconnect()
      }
    }
  }, [])

  // Connect to a room
  const connect = async (newToken: string, roomName?: string) => {
    if (!room) return

    try {
      setError(null)
      await room.connect(getLiveKitUrl(), newToken)

      // Update remote participants
      setRemoteParticipants(Array.from(room.remoteParticipants.values()))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to connect to room"))
      console.error("Error connecting to LiveKit room:", err)
    }
  }

  // Disconnect from the room
  const disconnect = () => {
    if (room) {
      room.disconnect()
      setIsConnected(false)
      setRemoteParticipants([])
    }
  }

  // Publish camera
  const publishCamera = async () => {
    if (!room || !room.localParticipant) return

    try {
      const track = await room.localParticipant.createCameraTrack()
      await room.localParticipant.publishTrack(track)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to publish camera"))
      console.error("Error publishing camera:", err)
    }
  }

  // Publish microphone
  const publishMicrophone = async () => {
    if (!room || !room.localParticipant) return

    try {
      const track = await room.localParticipant.createMicrophoneTrack()
      await room.localParticipant.publishTrack(track)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to publish microphone"))
      console.error("Error publishing microphone:", err)
    }
  }

  // Unpublish a track
  const unpublishTrack = async (trackSid: string) => {
    if (!room || !room.localParticipant) return

    try {
      await room.localParticipant.unpublishTrack(trackSid)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to unpublish track"))
      console.error("Error unpublishing track:", err)
    }
  }

  // Toggle camera
  const toggleCamera = async () => {
    if (!room || !room.localParticipant) return

    if (cameraTrackRef.current) {
      if (isCameraEnabled) {
        cameraTrackRef.current.track?.mute()
      } else {
        cameraTrackRef.current.track?.unmute()
      }
      setIsCameraEnabled(!isCameraEnabled)
    } else {
      await publishCamera()
    }
  }

  // Toggle microphone
  const toggleMicrophone = async () => {
    if (!room || !room.localParticipant) return

    if (microphoneTrackRef.current) {
      if (isMicrophoneEnabled) {
        microphoneTrackRef.current.track?.mute()
      } else {
        microphoneTrackRef.current.track?.unmute()
      }
      setIsMicrophoneEnabled(!isMicrophoneEnabled)
    } else {
      await publishMicrophone()
    }
  }

  return {
    room,
    connect,
    disconnect,
    isConnected,
    connectionState,
    error,
    localParticipant: room?.localParticipant || null,
    remoteParticipants,
    publishCamera,
    publishMicrophone,
    unpublishTrack,
    toggleCamera,
    toggleMicrophone,
    isCameraEnabled,
    isMicrophoneEnabled,
  }
}
