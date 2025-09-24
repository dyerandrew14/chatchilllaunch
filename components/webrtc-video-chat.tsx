"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { type SignalingService, getSignalingService } from "@/lib/signaling-service"
import { Button } from "@/components/ui/button"
import { Loader2, Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react"

interface WebRTCVideoChatProps {
  roomId: string
  userId: string
  signalingServerUrl: string
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: Error) => void
  className?: string
  autoConnect?: boolean
}

export function WebRTCVideoChat({
  roomId,
  userId,
  signalingServerUrl,
  onConnected,
  onDisconnected,
  onError,
  className = "",
  autoConnect = false,
}: WebRTCVideoChatProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [signalingConnected, setSignalingConnected] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const signalingServiceRef = useRef<SignalingService | null>(null)

  // Initialize WebRTC hook
  const {
    localStream,
    remoteStream,
    peerConnection,
    isConnected,
    error,
    startLocalStream,
    createOffer,
    handleOffer,
    handleAnswer,
    addIceCandidate,
    closeConnection,
  } = useWebRTC({
    onRemoteStream: (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream
      }
    },
    onConnectionStateChange: (state) => {
      if (state === "connected") {
        onConnected?.()
      } else if (state === "disconnected" || state === "failed" || state === "closed") {
        onDisconnected?.()
      }
    },
    onError: (err) => {
      onError?.(err)
    },
  })

  // Initialize signaling service
  useEffect(() => {
    signalingServiceRef.current = getSignalingService(signalingServerUrl, userId)

    // Connect to signaling server
    signalingServiceRef.current
      .connect()
      .then(() => {
        setSignalingConnected(true)
      })
      .catch((err) => {
        console.error("Failed to connect to signaling server:", err)
        onError?.(new Error("Failed to connect to signaling server"))
      })

    // Register message handler
    const unsubscribe = signalingServiceRef.current.onMessage(handleSignalingMessage)

    // Register connection state handler
    const unsubscribeState = signalingServiceRef.current.onConnectionState((state) => {
      setSignalingConnected(state === "connected")
    })

    // Clean up on unmount
    return () => {
      unsubscribe()
      unsubscribeState()
      if (signalingServiceRef.current) {
        signalingServiceRef.current.disconnect()
      }
    }
  }, [userId, signalingServerUrl, onError])

  // Handle signaling messages
  const handleSignalingMessage = useCallback(
    async (message: any) => {
      try {
        if (message.type === "offer" && message.senderId !== userId) {
          console.log("Received offer from:", message.senderId)
          const answer = await handleOffer({
            type: "offer",
            sdp: message.sdp,
          })

          if (signalingServiceRef.current) {
            signalingServiceRef.current.sendAnswer(roomId, answer)
          }
        } else if (message.type === "answer" && message.senderId !== userId) {
          console.log("Received answer from:", message.senderId)
          await handleAnswer({
            type: "answer",
            sdp: message.sdp,
          })
        } else if (message.type === "ice-candidate" && message.senderId !== userId) {
          console.log("Received ICE candidate from:", message.senderId)
          await addIceCandidate(message.candidate)
        } else if (message.type === "join" && message.senderId !== userId) {
          console.log("User joined room:", message.senderId)
          // If we're already in the room, send an offer to the new user
          if (isInitialized && peerConnection) {
            const offer = await createOffer()
            if (signalingServiceRef.current) {
              signalingServiceRef.current.sendOffer(roomId, offer)
            }
          }
        }
      } catch (err) {
        console.error("Error handling signaling message:", err)
        onError?.(err instanceof Error ? err : new Error("Failed to handle signaling message"))
      }
    },
    [userId, roomId, handleOffer, handleAnswer, addIceCandidate, createOffer, isInitialized, peerConnection, onError],
  )

  // Set up local video when stream is available
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Set up remote video when stream is available
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && signalingConnected && !isInitialized) {
      handleConnect()
    }
  }, [autoConnect, signalingConnected, isInitialized])

  // Handle connect button click
  const handleConnect = async () => {
    if (isConnecting || isConnected) return

    setIsConnecting(true)

    try {
      // Start local stream
      await startLocalStream()

      // Join the room
      if (signalingServiceRef.current) {
        signalingServiceRef.current.joinRoom(roomId)
      }

      setIsInitialized(true)
    } catch (err) {
      console.error("Failed to connect:", err)
      onError?.(err instanceof Error ? err : new Error("Failed to connect"))
    } finally {
      setIsConnecting(false)
    }
  }

  // Handle disconnect button click
  const handleDisconnect = () => {
    // Leave the room
    if (signalingServiceRef.current) {
      signalingServiceRef.current.leaveRoom(roomId)
    }

    // Close the connection
    closeConnection()

    setIsInitialized(false)
  }

  // Toggle audio mute
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Local video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!localStream || isVideoOff ? "hidden" : ""}`}
          />

          {(!localStream || isVideoOff) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <VideoOff className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                <p className="text-gray-400">Camera Off</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-2 left-2 text-sm bg-black/50 px-2 py-1 rounded">
            You {isMuted && "(Muted)"}
          </div>
        </div>

        {/* Remote video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${!remoteStream ? "hidden" : ""}`}
          />

          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                {isConnecting ? (
                  <>
                    <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin text-gray-500" />
                    <p className="text-gray-400">Connecting...</p>
                  </>
                ) : isInitialized ? (
                  <>
                    <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></div>
                    </div>
                    <p className="text-gray-400">Waiting for someone to join...</p>
                  </>
                ) : (
                  <>
                    <VideoOff className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400">No one connected</p>
                  </>
                )}
              </div>
            </div>
          )}

          {remoteStream && (
            <div className="absolute bottom-2 left-2 text-sm bg-black/50 px-2 py-1 rounded">Remote User</div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {!isInitialized ? (
          <Button
            onClick={handleConnect}
            disabled={isConnecting || !signalingConnected}
            className="bg-green-600 hover:bg-green-700"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Start Video Chat"
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={toggleMute}
              variant="outline"
              className={`${isMuted ? "bg-red-500/20 text-red-500 border-red-500/50" : "bg-gray-800"}`}
            >
              {isMuted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button>

            <Button
              onClick={toggleVideo}
              variant="outline"
              className={`${isVideoOff ? "bg-red-500/20 text-red-500 border-red-500/50" : "bg-gray-800"}`}
            >
              {isVideoOff ? <VideoOff className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
              {isVideoOff ? "Show Video" : "Hide Video"}
            </Button>

            <Button onClick={handleDisconnect} className="bg-red-600 hover:bg-red-700">
              <PhoneOff className="mr-2 h-4 w-4" />
              End Call
            </Button>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-500">
          <p className="font-medium">Error: {error.message}</p>
        </div>
      )}
    </div>
  )
}
