"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WebRTCConnectionStatus } from "@/components/webrtc-connection-status"

type WebRTCDiagnosticsProps = {
  isConnected: boolean
  isConnecting: boolean
  hasError: boolean
  onRetry: () => void
  className?: string
}

export function WebRTCDiagnostics({
  isConnected,
  isConnecting,
  hasError,
  onRetry,
  className = "",
}: WebRTCDiagnosticsProps) {
  const [networkInfo, setNetworkInfo] = useState<{
    downlink?: number
    effectiveType?: string
    rtt?: number
    saveData?: boolean
  }>({})

  useEffect(() => {
    // Get network information if available
    if ("connection" in navigator && navigator.connection) {
      const connection = navigator.connection as any
      setNetworkInfo({
        downlink: connection.downlink,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        saveData: connection.saveData,
      })

      const updateNetworkInfo = () => {
        setNetworkInfo({
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData,
        })
      }

      connection.addEventListener("change", updateNetworkInfo)
      return () => {
        connection.removeEventListener("change", updateNetworkInfo)
      }
    }
  }, [])

  return (
    <div className={`p-4 bg-gray-800 rounded-lg ${className}`}>
      <h3 className="text-lg font-medium mb-4">Connection Diagnostics</h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Connection Status:</span>
          <WebRTCConnectionStatus isConnected={isConnected} isConnecting={isConnecting} hasError={hasError} />
        </div>

        {networkInfo.effectiveType && (
          <div className="flex justify-between items-center">
            <span>Network Type:</span>
            <span>{networkInfo.effectiveType}</span>
          </div>
        )}

        {networkInfo.downlink !== undefined && (
          <div className="flex justify-between items-center">
            <span>Bandwidth:</span>
            <span>{networkInfo.downlink} Mbps</span>
          </div>
        )}

        {networkInfo.rtt !== undefined && (
          <div className="flex justify-between items-center">
            <span>Latency:</span>
            <span>{networkInfo.rtt} ms</span>
          </div>
        )}

        {hasError && (
          <Button onClick={onRetry} className="w-full mt-4">
            Retry Connection
          </Button>
        )}
      </div>
    </div>
  )
}
