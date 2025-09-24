"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useWebRTC } from "@/lib/webrtc-service"

type WebRTCCameraViewProps = {
  isLocal: boolean
  username: string
  countryFlag?: string
  isActive: boolean
  profileImage?: string
  onProfileClick?: () => void
  roomId?: string
  userId: string
  onVideoPublished?: (published: boolean) => void
  onConnected?: () => void
  onDisconnected?: () => void
}

export function WebRTCCameraView({
  isLocal,
  username,
  countryFlag,
  isActive,
  profileImage,
  onProfileClick,
  roomId,
  userId,
  onVideoPublished,
  onConnected,
  onDisconnected,
}: WebRTCCameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  const [needsPermissionRequest, setNeedsPermissionRequest] = useState(false)

  // Use our WebRTC hook
  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    error,
    initialize,
    startLocalStream,
    joinRoom,
    leaveRoom,
    cleanup,
    toggleVideo,
    toggleAudio,
  } = useWebRTC({
    onRemoteStream: (stream) => {
      // Only attach remote stream if this is not the local view
      if (!isLocal && videoRef.current) {
        console.log("Setting remote stream to video element")
        videoRef.current.srcObject = stream
      }
    },
    onConnectionStateChange: (state) => {
      console.log("Connection state changed:", state)
      if (state === "connected" && onConnected) {
        onConnected()
      } else if ((state === "disconnected" || state === "failed" || state === "closed") && onDisconnected) {
        onDisconnected()
      }
    },
    onError: (err) => {
      console.error("WebRTC error:", err)
      setHasError(true)
      setErrorMessage(err.message)
    },
    debug: true, // Enable debug logging
  })

  // Initialize WebRTC when component mounts
  useEffect(() => {
    if (userId) {
      initialize(userId)
    }

    return () => {
      cleanup()
    }
  }, [userId, initialize, cleanup])

  // Handle room joining/leaving
  useEffect(() => {
    if (isActive && !isLocal && roomId) {
      joinRoom(roomId)
    }

    return () => {
      if (!isLocal) {
        leaveRoom()
      }
    }
  }, [isActive, isLocal, roomId, joinRoom, leaveRoom])

  // Set up local video when component becomes active
  useEffect(() => {
    if (isActive && isLocal) {
      setupLocalCamera()
    }

    return () => {
      if (isLocal && videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream | null
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
          videoRef.current.srcObject = null
        }
      }
    }
  }, [isActive, isLocal])

  useEffect(() => {
    // Check if we're in an iframe
    const isInIframe = window !== window.parent

    if (isInIframe && isActive && isLocal) {
      setNeedsPermissionRequest(true)
    }
  }, [isActive, isLocal])

  // Update video element when streams change
  useEffect(() => {
    if (videoRef.current) {
      if (isLocal && localStream) {
        videoRef.current.srcObject = localStream
      } else if (!isLocal && remoteStream) {
        videoRef.current.srcObject = remoteStream
      }
    }
  }, [isLocal, localStream, remoteStream])

  // Handle errors
  useEffect(() => {
    if (error) {
      setHasError(true)
      setErrorMessage(error.message)
    } else {
      setHasError(false)
      setErrorMessage(null)
    }
  }, [error])

  const setupLocalCamera = async () => {
    try {
      setHasError(false)
      setErrorMessage(null)

      // Check if we're in an iframe
      const isInIframe = window !== window.parent

      if (isInIframe) {
        console.warn("Running in iframe - camera access might be restricted")
      }

      // Get user media with a more robust approach
      try {
        const stream = await startLocalStream()

        // Report successful video publishing
        if (onVideoPublished) {
          onVideoPublished(true)
        }
      } catch (permissionError) {
        console.error("Permission error:", permissionError)
        setHasError(true)
        setErrorMessage(
          "Camera access was denied. Please allow camera access in your browser settings and refresh the page.",
        )

        // Report failed video publishing
        if (onVideoPublished) {
          onVideoPublished(false)
        }
      }
    } catch (err) {
      console.error("Error in setupLocalCamera:", err)
      setHasError(true)
      setErrorMessage(
        "Failed to access camera. This might be due to browser restrictions or permissions. " +
          "Try opening this page in a new tab.",
      )

      // Report failed video publishing
      if (onVideoPublished) {
        onVideoPublished(false)
      }
    }
  }

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      setErrorMessage("Maximum retry attempts reached. Please refresh the page.")
      return
    }

    setRetryCount((prev) => prev + 1)
    setHasError(false)
    setErrorMessage(null)

    if (isLocal) {
      await setupLocalCamera()
    } else if (roomId) {
      joinRoom(roomId)
    }
  }

  return (
    <div className="relative h-full bg-gray-900 overflow-hidden">
      {needsPermissionRequest && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="max-w-md rounded-lg bg-gray-800 p-6 text-center text-white">
            <p className="mb-4">This app needs camera and microphone access to work.</p>
            <button
              onClick={() => {
                setNeedsPermissionRequest(false)
                setupLocalCamera()
              }}
              className="px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
            >
              Allow Camera & Mic Access
            </button>
          </div>
        </div>
      )}
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Mute local video to prevent feedback
        className={cn("h-full w-full object-cover", !isActive && "hidden", isConnecting && "opacity-50")}
        onLoadedMetadata={() => {
          // Handle video play promise to prevent interruption errors
          if (videoRef.current) {
            const playPromise = videoRef.current.play()
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.log("Video play was interrupted:", error)
                // Don't throw the error, just log it
              })
            }
          }
        }}
        onError={(e) => {
          console.error("Video element error:", e)
          setHasError(true)
          setErrorMessage("Video playback error")
        }}
      />

      {/* Connection state indicator */}
      {isConnecting && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-black text-xs rounded-md">
          Connecting...
        </div>
      )}

      {/* Loading overlay */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-yellow-500"></div>
        </div>
      )}

      {/* Error message */}
      {hasError && errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="max-w-md rounded-lg bg-red-900/80 p-4 text-center text-white">
            <p className="mb-2 text-lg font-bold">Camera Error</p>
            <p className="mb-4">{errorMessage}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
            >
              Retry ({maxRetries - retryCount} attempts left)
            </button>
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

      {/* Connection quality indicator */}
      {isConnected && !isLocal && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md flex items-center">
          <div className="flex space-x-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-2 text-xs text-white">Connected</span>
        </div>
      )}
    </div>
  )
}
