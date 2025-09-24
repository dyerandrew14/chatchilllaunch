"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { WebRTCClient } from "@/lib/webrtc-client"

type UseWebRTCChatOptions = {
  signalingServerUrl: string
  userId: string
  onRemoteStream?: (stream: MediaStream) => void
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  onError?: (error: Error) => void
  onUserJoined?: (userId: string) => void
  onUserLeft?: (userId: string) => void
  iceServers?: RTCIceServer[]
}

export function useWebRTCChat({
  signalingServerUrl,
  userId,
  onRemoteStream,
  onConnectionStateChange,
  onError,
  onUserJoined,
  onUserLeft,
  iceServers,
}: UseWebRTCChatOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const webrtcClientRef = useRef<WebRTCClient | null>(null)

  // Initialize WebRTC client
  useEffect(() => {
    const client = new WebRTCClient(userId, signalingServerUrl, {
      iceServers,
      onRemoteStream: (stream) => {
        if (onRemoteStream) {
          onRemoteStream(stream)
        }
      },
      onConnectionStateChange: (state) => {
        setIsConnected(state === "connected")
        if (onConnectionStateChange) {
          onConnectionStateChange(state)
        }
      },
      onError: (err) => {
        setError(err)
        if (onError) {
          onError(err)
        }
      },
      onUserJoined,
      onUserLeft,
    })

    webrtcClientRef.current = client

    // Connect to signaling server
    client.connect().catch((err) => {
      setError(err instanceof Error ? err : new Error("Failed to connect to signaling server"))
      if (onError) {
        onError(err instanceof Error ? err : new Error("Failed to connect to signaling server"))
      }
    })

    // Clean up on unmount
    return () => {
      if (webrtcClientRef.current) {
        webrtcClientRef.current.disconnect()
        webrtcClientRef.current = null
      }
    }
  }, [
    signalingServerUrl,
    userId,
    onRemoteStream,
    onConnectionStateChange,
    onError,
    onUserJoined,
    onUserLeft,
    iceServers,
  ])

  // Start local stream
  const startLocalStream = useCallback(async (constraints: MediaStreamConstraints = { video: true, audio: true }) => {
    if (!webrtcClientRef.current) {
      throw new Error("WebRTC client not initialized")
    }

    setIsConnecting(true)
    try {
      const stream = await webrtcClientRef.current.startLocalStream(constraints)
      setLocalStream(stream)
      return stream
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to start local stream"))
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [])

  // Join a room
  const joinRoom = useCallback((roomId: string) => {
    if (!webrtcClientRef.current) {
      throw new Error("WebRTC client not initialized")
    }

    webrtcClientRef.current.joinRoom(roomId)
    setCurrentRoomId(roomId)
  }, [])

  // Leave the current room
  const leaveRoom = useCallback(() => {
    if (!webrtcClientRef.current) {
      return
    }

    webrtcClientRef.current.leaveRoom()
    setCurrentRoomId(null)
  }, [])

  // Toggle audio
  const toggleAudio = useCallback((enabled: boolean) => {
    if (!webrtcClientRef.current) {
      return
    }

    webrtcClientRef.current.toggleAudio(enabled)
  }, [])

  // Toggle video
  const toggleVideo = useCallback((enabled: boolean) => {
    if (!webrtcClientRef.current) {
      return
    }

    webrtcClientRef.current.toggleVideo(enabled)
  }, [])

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    if (!webrtcClientRef.current) {
      return
    }

    webrtcClientRef.current.stopLocalStream()
    setLocalStream(null)
  }, [])

  // Disconnect
  const disconnect = useCallback(() => {
    if (!webrtcClientRef.current) {
      return
    }

    webrtcClientRef.current.disconnect()
    setLocalStream(null)
    setIsConnected(false)
    setCurrentRoomId(null)
  }, [])

  return {
    localStream,
    isConnected,
    isConnecting,
    currentRoomId,
    error,
    startLocalStream,
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
    stopLocalStream,
    disconnect,
  }
}
