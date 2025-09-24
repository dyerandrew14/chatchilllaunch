"use client"

import { useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface VolumeControlProps {
  label: string
  initialVolume?: number
  onVolumeChange: (volume: number) => void
}

export function VolumeControl({ label, initialVolume = 100, onVolumeChange }: VolumeControlProps) {
  const [volume, setVolume] = useState(initialVolume)
  const [isMuted, setIsMuted] = useState(false)

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    onVolumeChange(isMuted ? 0 : newVolume)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    onVolumeChange(isMuted ? volume : 0)
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggleMute} className="text-gray-300 hover:text-white">
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      <div className="flex-1">
        <Slider value={[volume]} min={0} max={100} step={1} onValueChange={handleVolumeChange} className="h-2" />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{volume}%</span>
    </div>
  )
}
