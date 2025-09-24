"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type WebRTCConfig = {
  iceServers?: RTCIceServer[]
  onRemoteStream?: (stream: MediaStream) => void
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void
  onError?: (error: Error) => void
}

type UseWebRTCReturn = {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  peerConnection: RTCPeerConnection | null
  connectionState: RTCPeerConnectionState | null
  iceConnectionState: RTCIceConnectionState | null
  error: Error | null
  isInitiator: boolean
  isConnected: boolean
  createOffer: () => Promise<RTCSessionDescriptionInit>
  handleOffer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>
  handleAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>
  handleIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>
  startLocalStream: () => Promise<MediaStream>
  stopLocalStream: () => void
  closeConnection: () => void
}

export function useWebRTC(config?: WebRTCConfig): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null)
  const [iceConnectionState, setIceConnectionState] = useState<RTCIceConnectionState | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isInitiator, setIsInitiator] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([])
  const hasRemoteDescription = useRef(false)

  // Handle ICE candidate (to be sent to the remote peer)
  const handleIceCandidate = useRef(async (candidate: RTCIceCandidateInit) => {
    // This function is called when we generate a candidate locally
    // You would typically send this to the remote peer through your signaling server
    console.log("Local ICE candidate:", candidate)
    return candidate
  }).current

  // Default ICE servers if none provided
  const defaultIceServers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ]

  // Initialize peer connection
  const initPeerConnection = useCallback(() => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: config?.iceServers || defaultIceServers,
        iceCandidatePoolSize: 10, // Add this to improve connection establishment
      })

      // Set up event handlers
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Store the candidate to be sent via signaling
          const candidate = event.candidate.toJSON()
          console.log("Generated ICE candidate:", candidate)

          // If we have a handleIceCandidate callback, call it
          if (typeof handleIceCandidate === "function") {
            handleIceCandidate(candidate)
          }
        }
      }

      pc.oniceconnectionstatechange = () => {
        setIceConnectionState(pc.iceConnectionState)
        config?.onIceConnectionStateChange?.(pc.iceConnectionState)

        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          setIsConnected(true)
        } else if (
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "closed"
        ) {
          setIsConnected(false)
        }
      }

      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState)
        config?.onConnectionStateChange?.(pc.connectionState)

        if (pc.connectionState === "connected") {
          setIsConnected(true)
        } else if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          setIsConnected(false)
        }
      }

      pc.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind)
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0])
          config?.onRemoteStream?.(event.streams[0])
        }
      }

      setPeerConnection(pc)
      return pc
    } catch (err) {
      console.error("Failed to create RTCPeerConnection:", err)
      const error = err instanceof Error ? err : new Error("Failed to create peer connection")
      setError(error)
      config?.onError?.(error)
      throw error
    }
  }, [config, handleIceCandidate])

  // Start local media stream
  const startLocalStream = useCallback(async () => {
    try {
      // First check if we have permissions
      if (navigator.permissions && navigator.permissions.query) {
        const cameraPermission = await navigator.permissions.query({ name: "camera" as PermissionName })
        const micPermission = await navigator.permissions.query({ name: "microphone" as PermissionName })

        if (cameraPermission.state === "denied" || micPermission.state === "denied") {
          throw new Error("Camera or microphone permission denied")
        }
      }

      // Try to get the stream with both video and audio
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setLocalStream(stream)

        // Add tracks to peer connection if it exists
        if (peerConnection) {
          stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream)
          })
        }

        return stream
      } catch (err) {
        // If that fails, try with just video
        console.warn("Failed to get audio+video, trying video only:", err)
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        setLocalStream(stream)

        if (peerConnection) {
          stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream)
          })
        }

        return stream
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get user media")
      setError(error)
      config?.onError?.(error)
      throw error
    }
  }, [peerConnection, config])

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }
  }, [localStream])

  // Create an offer (initiator)
  const createOffer = useCallback(async () => {
    if (!peerConnection) {
      throw new Error("Peer connection not initialized")
    }

    try {
      setIsInitiator(true)
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      return offer
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create offer")
      setError(error)
      config?.onError?.(error)
      throw error
    }
  }, [peerConnection, config])

  // Handle an offer (receiver)
  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnection) {
        throw new Error("Peer connection not initialized")
      }

      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        hasRemoteDescription.current = true

        // Process any queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift()
          if (candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          }
        }

        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        return answer
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to handle offer")
        setError(error)
        config?.onError?.(error)
        throw error
      }
    },
    [peerConnection, config],
  )

  // Handle an answer
  const handleAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      if (!peerConnection) {
        throw new Error("Peer connection not initialized")
      }

      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        hasRemoteDescription.current = true

        // Process any queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift()
          if (candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to handle answer")
        setError(error)
        config?.onError?.(error)
        throw error
      }
    },
    [peerConnection, config],
  )

  // Add ICE candidate received from remote peer
  const addIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      if (!peerConnection) {
        throw new Error("Peer connection not initialized")
      }

      try {
        if (hasRemoteDescription.current) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        } else {
          // Queue the candidate if we don't have a remote description yet
          iceCandidatesQueue.current.push(candidate)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to add ICE candidate")
        setError(error)
        config?.onError?.(error)
        throw error
      }
    },
    [peerConnection, config],
  )

  // Close the connection
  const closeConnection = useCallback(() => {
    if (peerConnection) {
      peerConnection.close()
      setPeerConnection(null)
      setConnectionState(null)
      setIceConnectionState(null)
      setIsConnected(false)
    }
    stopLocalStream()
    setRemoteStream(null)
    hasRemoteDescription.current = false
    iceCandidatesQueue.current = []
  }, [peerConnection, stopLocalStream])

  // Initialize peer connection on mount
  useEffect(() => {
    const pc = initPeerConnection()

    // Clean up on unmount
    return () => {
      if (pc) {
        pc.close()
      }
      stopLocalStream()
    }
  }, [initPeerConnection, stopLocalStream])

  return {
    localStream,
    remoteStream,
    peerConnection,
    connectionState,
    iceConnectionState,
    error,
    isInitiator,
    isConnected,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    addIceCandidate,
    startLocalStream,
    stopLocalStream,
    closeConnection,
  }
}
