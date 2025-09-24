"use client"

import { useRef, useState, useCallback, useEffect } from "react"

// Types for our WebRTC service
export type WebRTCConfig = {
  onRemoteStream?: (stream: MediaStream) => void
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void
  onError?: (error: Error) => void
  onConnected?: () => void
  onDisconnected?: () => void
  iceServers?: RTCIceServer[]
  debug?: boolean
}

export type WebRTCState = {
  isConnecting: boolean
  isConnected: boolean
  error: Error | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
}

// Default STUN/TURN servers
const DEFAULT_ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
]

export function useWebRTC(config: WebRTCConfig = {}) {
  // State
  const [state, setState] = useState<WebRTCState>({
    isConnecting: false,
    isConnected: false,
    error: null,
    localStream: null,
    remoteStream: null,
  })

  // Refs to maintain values across renders
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const roomIdRef = useRef<string | null>(null)
  const userIdRef = useRef<string | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef<number>(0)
  const maxReconnectAttempts = 5

  // Debug logging
  const log = useCallback(
    (...args: any[]) => {
      if (config.debug) {
        console.log("[WebRTC]", ...args)
      }
    },
    [config.debug],
  )

  // Get the signaling server URL from environment variables with fallback
  const signalingServerUrl =
    process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || "wss://chatchill-signaling-server.onrender.com"

  // Initialize WebSocket connection
  const initializeSocket = useCallback(() => {
    if (!userIdRef.current) {
      console.error("Cannot initialize socket: userId is not set")
      return
    }

    // Close existing socket if any
    if (socketRef.current) {
      socketRef.current.close()
    }

    try {
      log(`Connecting to signaling server: ${signalingServerUrl}`)
      const socket = new WebSocket(signalingServerUrl)
      socketRef.current = socket

      socket.onopen = () => {
        log("WebSocket connection established")
        reconnectAttemptsRef.current = 0

        // Register with the signaling server
        if (userIdRef.current) {
          socket.send(
            JSON.stringify({
              type: "register",
              userId: userIdRef.current,
            }),
          )
        }
      }

      socket.onmessage = (event) => {
        handleSignalingMessage(event.data)
      }

      socket.onclose = (event) => {
        log(`WebSocket connection closed: ${event.code} ${event.reason}`)

        if (config.onDisconnected) {
          config.onDisconnected()
        }

        // Update state
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }))

        // Attempt to reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          log(`Reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`)

          reconnectTimeoutRef.current = setTimeout(() => {
            if (userIdRef.current) {
              log("Attempting to reconnect...")
              initializeSocket()
            }
          }, delay)
        } else {
          log("Max reconnect attempts reached")
          setState((prev) => ({
            ...prev,
            error: new Error("Failed to connect to signaling server after multiple attempts"),
          }))

          if (config.onError) {
            config.onError(new Error("Failed to connect to signaling server after multiple attempts"))
          }
        }
      }

      socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        setState((prev) => ({
          ...prev,
          error: new Error("WebSocket connection error"),
        }))

        if (config.onError) {
          config.onError(new Error("WebSocket connection error"))
        }
      }
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Failed to initialize WebSocket"),
      }))

      if (config.onError) {
        config.onError(error instanceof Error ? error : new Error("Failed to initialize WebSocket"))
      }
    }
  }, [signalingServerUrl, config, log])

  // Handle signaling messages
  const handleSignalingMessage = useCallback(
    (data: string) => {
      try {
        const message = JSON.parse(data)
        log("Received signaling message:", message.type)

        switch (message.type) {
          case "registered":
            log("Registered with signaling server as:", message.userId)

            // If we have a room to join, join it now
            if (roomIdRef.current) {
              joinRoom(roomIdRef.current)
            }
            break

          case "room-joined":
            log("Joined room:", message.roomId)
            log("Users in room:", message.users)

            // Create peer connections with existing users
            message.users.forEach((peerId: string) => {
              createPeerConnection(peerId)
              createAndSendOffer(peerId)
            })
            break

          case "user-joined":
            log("User joined room:", message.userId)
            break

          case "user-left":
            log("User left room:", message.userId)
            closePeerConnection()
            break

          case "offer":
            log("Received offer from:", message.senderId)
            handleOffer(message)
            break

          case "answer":
            log("Received answer from:", message.senderId)
            handleAnswer(message)
            break

          case "ice-candidate":
            log("Received ICE candidate from:", message.senderId)
            handleIceCandidate(message)
            break

          case "error":
            console.error("Signaling server error:", message.message)
            setState((prev) => ({
              ...prev,
              error: new Error(message.message),
            }))

            if (config.onError) {
              config.onError(new Error(message.message))
            }
            break
        }
      } catch (error) {
        console.error("Error handling signaling message:", error)
      }
    },
    [log],
  )

  // Send message to signaling server
  const sendToSignalingServer = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message))
    } else {
      console.error("Cannot send message: WebSocket is not open")
    }
  }, [])

  // Join a room
  const joinRoom = useCallback(
    (roomId: string) => {
      roomIdRef.current = roomId

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && userIdRef.current) {
        log(`Joining room: ${roomId}`)
        sendToSignalingServer({
          type: "join",
          roomId,
        })
      } else {
        log("Socket not ready, will join room when connected")
      }
    },
    [sendToSignalingServer, log],
  )

  // Leave the current room
  const leaveRoom = useCallback(() => {
    if (roomIdRef.current && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      sendToSignalingServer({
        type: "leave",
        roomId: roomIdRef.current,
      })
    }

    closePeerConnection()
    roomIdRef.current = null
  }, [sendToSignalingServer])

  // Create a peer connection
  const createPeerConnection = useCallback(
    (peerId: string) => {
      try {
        // Use provided ICE servers or default ones
        const iceServers = config.iceServers || DEFAULT_ICE_SERVERS

        log("Creating peer connection with ICE servers:", iceServers)
        const pc = new RTCPeerConnection({ iceServers })
        peerConnectionRef.current = pc

        // Add local tracks to the connection
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            if (localStreamRef.current) {
              pc.addTrack(track, localStreamRef.current)
            }
          })
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && roomIdRef.current) {
            sendToSignalingServer({
              type: "ice-candidate",
              candidate: event.candidate,
              targetUserId: peerId,
              roomId: roomIdRef.current,
            })
          }
        }

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          log("Connection state:", pc.connectionState)

          if (pc.connectionState === "connected") {
            setState((prev) => ({
              ...prev,
              isConnected: true,
              isConnecting: false,
            }))

            if (config.onConnected) {
              config.onConnected()
            }
          } else if (
            pc.connectionState === "disconnected" ||
            pc.connectionState === "failed" ||
            pc.connectionState === "closed"
          ) {
            setState((prev) => ({
              ...prev,
              isConnected: false,
              isConnecting: false,
            }))

            if (config.onDisconnected) {
              config.onDisconnected()
            }
          }

          if (config.onConnectionStateChange) {
            config.onConnectionStateChange(pc.connectionState)
          }
        }

        // Handle ICE connection state changes
        pc.oniceconnectionstatechange = () => {
          log("ICE connection state:", pc.iceConnectionState)

          if (config.onIceConnectionStateChange) {
            config.onIceConnectionStateChange(pc.iceConnectionState)
          }
        }

        // Handle remote tracks
        pc.ontrack = (event) => {
          log("Received remote track")
          if (event.streams && event.streams[0]) {
            remoteStreamRef.current = event.streams[0]

            setState((prev) => ({
              ...prev,
              remoteStream: event.streams[0],
            }))

            if (config.onRemoteStream) {
              config.onRemoteStream(event.streams[0])
            }
          }
        }

        return pc
      } catch (error) {
        console.error("Error creating peer connection:", error)
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error("Failed to create peer connection"),
        }))

        if (config.onError) {
          config.onError(error instanceof Error ? error : new Error("Failed to create peer connection"))
        }
        return null
      }
    },
    [config, sendToSignalingServer, log],
  )

  // Close peer connection
  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop())
      remoteStreamRef.current = null

      setState((prev) => ({
        ...prev,
        remoteStream: null,
        isConnected: false,
      }))
    }
  }, [])

  // Create and send an offer
  const createAndSendOffer = useCallback(
    async (peerId: string) => {
      try {
        const pc = peerConnectionRef.current
        if (!pc || !roomIdRef.current) return

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        sendToSignalingServer({
          type: "offer",
          sdp: offer.sdp,
          targetUserId: peerId,
          roomId: roomIdRef.current,
        })
      } catch (error) {
        console.error("Error creating offer:", error)
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error("Failed to create offer"),
        }))

        if (config.onError) {
          config.onError(error instanceof Error ? error : new Error("Failed to create offer"))
        }
      }
    },
    [sendToSignalingServer],
  )

  // Handle an incoming offer
  const handleOffer = useCallback(
    async (message: any) => {
      try {
        const peerId = message.senderId

        // Create peer connection if it doesn't exist
        if (!peerConnectionRef.current) {
          createPeerConnection(peerId)
        }

        const pc = peerConnectionRef.current
        if (!pc || !roomIdRef.current) return

        await pc.setRemoteDescription(
          new RTCSessionDescription({
            type: "offer",
            sdp: message.sdp,
          }),
        )

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        sendToSignalingServer({
          type: "answer",
          sdp: answer.sdp,
          targetUserId: peerId,
          roomId: roomIdRef.current,
        })
      } catch (error) {
        console.error("Error handling offer:", error)
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error("Failed to handle offer"),
        }))

        if (config.onError) {
          config.onError(error instanceof Error ? error : new Error("Failed to handle offer"))
        }
      }
    },
    [createPeerConnection, sendToSignalingServer],
  )

  // Handle an incoming answer
  const handleAnswer = useCallback(async (message: any) => {
    try {
      const pc = peerConnectionRef.current
      if (!pc) return

      await pc.setRemoteDescription(
        new RTCSessionDescription({
          type: "answer",
          sdp: message.sdp,
        }),
      )
    } catch (error) {
      console.error("Error handling answer:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Failed to handle answer"),
      }))

      if (config.onError) {
        config.onError(error instanceof Error ? error : new Error("Failed to handle answer"))
      }
    }
  }, [])

  // Handle an incoming ICE candidate
  const handleIceCandidate = useCallback(async (message: any) => {
    try {
      const pc = peerConnectionRef.current
      if (!pc) return

      await pc.addIceCandidate(new RTCIceCandidate(message.candidate))
    } catch (error) {
      console.error("Error handling ICE candidate:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Failed to handle ICE candidate"),
      }))

      if (config.onError) {
        config.onError(error instanceof Error ? error : new Error("Failed to handle ICE candidate"))
      }
    }
  }, [])

  // Start local media stream
  const startLocalStream = useCallback(
    async (constraints: MediaStreamConstraints = { video: true, audio: true }) => {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }))

      try {
        log("Getting user media with constraints:", constraints)
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        localStreamRef.current = stream

        setState((prev) => ({
          ...prev,
          localStream: stream,
          isConnecting: false,
        }))

        // Add tracks to peer connection if it exists
        if (peerConnectionRef.current) {
          stream.getTracks().forEach((track) => {
            if (localStreamRef.current && peerConnectionRef.current) {
              peerConnectionRef.current.addTrack(track, localStreamRef.current)
            }
          })
        }

        return stream
      } catch (error) {
        console.error("Error getting user media:", error)
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: error instanceof Error ? error : new Error("Failed to get user media"),
        }))

        if (config.onError) {
          config.onError(error instanceof Error ? error : new Error("Failed to get user media"))
        }
        throw error
      }
    },
    [log],
  )

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null

      setState((prev) => ({
        ...prev,
        localStream: null,
      }))
    }
  }, [])

  // Initialize WebRTC connection
  const initialize = useCallback(
    (userId: string) => {
      userIdRef.current = userId
      initializeSocket()
    },
    [initializeSocket],
  )

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    // Leave room if in one
    leaveRoom()

    // Close peer connection
    closePeerConnection()

    // Stop local stream
    stopLocalStream()

    // Close WebSocket
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    // Reset state
    setState({
      isConnecting: false,
      isConnected: false,
      error: null,
      localStream: null,
      remoteStream: null,
    })

    // Reset refs
    userIdRef.current = null
    roomIdRef.current = null
    reconnectAttemptsRef.current = 0
  }, [leaveRoom, closePeerConnection, stopLocalStream])

  // Toggle audio
  const toggleAudio = useCallback((enabled: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }, [])

  // Toggle video
  const toggleVideo = useCallback((enabled: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }, [])

  // Check connection status periodically
  useEffect(() => {
    const checkConnectionInterval = setInterval(() => {
      const pc = peerConnectionRef.current
      if (pc && pc.connectionState === "connected") {
        // Check if we're still receiving data
        const stats = pc.getStats()
        stats.then((statsReport) => {
          let hasActiveInboundStream = false
          statsReport.forEach((report) => {
            if (report.type === "inbound-rtp" && report.bytesReceived > 0) {
              hasActiveInboundStream = true
            }
          })

          if (!hasActiveInboundStream) {
            log("No active inbound stream detected, connection may be stale")
            // You could trigger a reconnection here if needed
          }
        })
      }
    }, 10000) // Check every 10 seconds

    return () => {
      clearInterval(checkConnectionInterval)
    }
  }, [log])

  return {
    ...state,
    initialize,
    startLocalStream,
    stopLocalStream,
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
    cleanup,
  }
}
