"use client"

import { useState } from "react"
import { Mic, MicOff, Video, VideoOff } from "lucide-react"
import { Button } from "@/components/ui/button"

type WebRTCControlsProps = {
  onToggleAudio: (enabled: boolean) => void
  onToggleVideo: (enabled: boolean) => void
  className?: string
}

export function WebRTCControls({ onToggleAudio, onToggleVideo, className = "" }: WebRTCControlsProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  const toggleAudio = () => {
    const newState = !isAudioEnabled
    setIsAudioEnabled(newState)
    onToggleAudio(newState)
  }

  const toggleVideo = () => {
    const newState = !isVideoEnabled
    setIsVideoEnabled(newState)
    onToggleVideo(newState)
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleAudio}
        className={`rounded-full ${!isAudioEnabled ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : ""}`}
      >
        {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleVideo}
        className={`rounded-full ${!isVideoEnabled ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : ""}`}
      >
        {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </Button>
    </div>
  )
}
