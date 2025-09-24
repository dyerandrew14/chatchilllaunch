"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

type WebRTCDebugPanelProps = {
  peerConnection: RTCPeerConnection | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  signalingState: string
  iceConnectionState: string
  connectionState: string
  iceCandidates: RTCIceCandidate[]
}

export function WebRTCDebugPanel({
  peerConnection,
  localStream,
  remoteStream,
  signalingState,
  iceConnectionState,
  connectionState,
  iceCandidates,
}: WebRTCDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isExpanded && peerConnection) {
      const interval = setInterval(async () => {
        try {
          const statsReport = await peerConnection.getStats()
          const statsObj: any = {}

          statsReport.forEach((report) => {
            if (report.type === "inbound-rtp" || report.type === "outbound-rtp") {
              statsObj[report.id] = report
            }
          })

          setStats(statsObj)
        } catch (error) {
          console.error("Failed to get WebRTC stats:", error)
        }
      }, 1000)

      setRefreshInterval(interval)
      return () => {
        clearInterval(interval)
      }
    } else if (refreshInterval) {
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }
  }, [isExpanded, peerConnection])

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-96 bg-gray-900 text-white rounded-t-lg shadow-lg z-50">
      <div className="p-2 cursor-pointer flex justify-between items-center" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="font-medium">WebRTC Debug Panel</h3>
        <span>{isExpanded ? "▼" : "▲"}</span>
      </div>

      {isExpanded && (
        <div className="p-4 max-h-96 overflow-y-auto text-sm">
          <div className="mb-4">
            <h4 className="font-semibold mb-1">Connection States</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p>
                  Signaling:{" "}
                  <span className={signalingState === "stable" ? "text-green-400" : "text-yellow-400"}>
                    {signalingState}
                  </span>
                </p>
                <p>
                  ICE:{" "}
                  <span className={iceConnectionState === "connected" ? "text-green-400" : "text-yellow-400"}>
                    {iceConnectionState}
                  </span>
                </p>
                <p>
                  Connection:{" "}
                  <span className={connectionState === "connected" ? "text-green-400" : "text-yellow-400"}>
                    {connectionState}
                  </span>
                </p>
              </div>
              <div>
                <p>Local Tracks: {localStream?.getTracks().length || 0}</p>
                <p>Remote Tracks: {remoteStream?.getTracks().length || 0}</p>
                <p>ICE Candidates: {iceCandidates.length}</p>
              </div>
            </div>
          </div>

          {stats && (
            <div className="mb-4">
              <h4 className="font-semibold mb-1">Stream Stats</h4>
              <div className="space-y-2">
                {Object.values(stats).map((stat: any) => (
                  <div key={stat.id} className="bg-gray-800 p-2 rounded">
                    <p className="font-medium">
                      {stat.type === "inbound-rtp" ? "Receiving" : "Sending"} {stat.kind}
                    </p>
                    {stat.bytesReceived && <p>Bytes Received: {(stat.bytesReceived / 1024).toFixed(2)} KB</p>}
                    {stat.bytesSent && <p>Bytes Sent: {(stat.bytesSent / 1024).toFixed(2)} KB</p>}
                    {stat.packetsLost && <p>Packets Lost: {stat.packetsLost}</p>}
                    {stat.frameWidth && (
                      <p>
                        Resolution: {stat.frameWidth}x{stat.frameHeight}
                      </p>
                    )}
                    {stat.frameRate && <p>Frame Rate: {Math.round(stat.frameRate)} fps</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-1">ICE Candidates</h4>
            <div className="bg-gray-800 p-2 rounded max-h-32 overflow-y-auto">
              {iceCandidates.length > 0 ? (
                iceCandidates.map((candidate, index) => (
                  <div key={index} className="text-xs mb-1 truncate">
                    {candidate.candidate}
                  </div>
                ))
              ) : (
                <p>No ICE candidates gathered yet</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (peerConnection) {
                  peerConnection.restartIce()
                }
              }}
            >
              Restart ICE
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (localStream) {
                  const videoTrack = localStream.getVideoTracks()[0]
                  if (videoTrack) {
                    videoTrack.enabled = !videoTrack.enabled
                  }
                }
              }}
            >
              Toggle Video
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (localStream) {
                  const audioTrack = localStream.getAudioTracks()[0]
                  if (audioTrack) {
                    audioTrack.enabled = !audioTrack.enabled
                  }
                }
              }}
            >
              Toggle Audio
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
