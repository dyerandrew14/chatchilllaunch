"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, AlertTriangle } from "lucide-react"

type ConnectionStatusProps = {
  isConnected: boolean
  isConnecting: boolean
  hasError: boolean
  className?: string
}

export function WebRTCConnectionStatus({ isConnected, isConnecting, hasError, className = "" }: ConnectionStatusProps) {
  const [connectionQuality, setConnectionQuality] = useState<"good" | "medium" | "poor" | "none">("none")

  useEffect(() => {
    if (hasError) {
      setConnectionQuality("none")
    } else if (isConnected) {
      // In a real app, you would measure actual connection quality
      // For now, we'll just simulate good quality
      setConnectionQuality("good")
    } else if (isConnecting) {
      setConnectionQuality("medium")
    } else {
      setConnectionQuality("none")
    }
  }, [isConnected, isConnecting, hasError])

  if (hasError) {
    return (
      <div className={`flex items-center space-x-2 text-red-500 ${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <span className="text-xs">Connection Error</span>
      </div>
    )
  }

  if (isConnecting) {
    return (
      <div className={`flex items-center space-x-2 text-yellow-500 ${className}`}>
        <Wifi className="h-4 w-4 animate-pulse" />
        <span className="text-xs">Connecting...</span>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <WifiOff className="h-4 w-4" />
        <span className="text-xs">Disconnected</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Wifi className="h-4 w-4 text-green-500" />
      <div className="flex items-center space-x-1">
        <div
          className={`h-1.5 w-1.5 rounded-full ${connectionQuality === "good" || connectionQuality === "medium" || connectionQuality === "poor" ? "bg-green-500" : "bg-gray-500"}`}
        ></div>
        <div
          className={`h-1.5 w-1.5 rounded-full ${connectionQuality === "good" || connectionQuality === "medium" ? "bg-green-500" : "bg-gray-500"}`}
        ></div>
        <div
          className={`h-1.5 w-1.5 rounded-full ${connectionQuality === "good" ? "bg-green-500" : "bg-gray-500"}`}
        ></div>
      </div>
      <span className="text-xs text-green-500">Connected</span>
    </div>
  )
}
