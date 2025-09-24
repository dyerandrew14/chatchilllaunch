"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipForward, SkipBack, X, Music } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { SAMPLE_TRACKS } from "@/lib/constants"

interface MusicPlayerProps {
  onClose: () => void
}

export function MusicPlayer({ onClose }: MusicPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState(SAMPLE_TRACKS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(80)

  // Simulate playing music
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext()
            return 0
          }
          return prev + 1
        })
      }, 300) // Faster for demo purposes
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    const currentIndex = SAMPLE_TRACKS.findIndex((track) => track.id === currentTrack.id)
    const nextIndex = (currentIndex + 1) % SAMPLE_TRACKS.length
    setCurrentTrack(SAMPLE_TRACKS[nextIndex])
    setProgress(0)
  }

  const handlePrev = () => {
    const currentIndex = SAMPLE_TRACKS.findIndex((track) => track.id === currentTrack.id)
    const prevIndex = (currentIndex - 1 + SAMPLE_TRACKS.length) % SAMPLE_TRACKS.length
    setCurrentTrack(SAMPLE_TRACKS[prevIndex])
    setProgress(0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-medium flex items-center">
            <Music className="mr-2 h-5 w-5 text-green-500" />
            Music Player
          </h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="flex flex-col items-center mb-6">
            <img
              src={currentTrack.albumArt || "/placeholder.svg"}
              alt={currentTrack.title}
              className="w-48 h-48 object-cover rounded-lg shadow-lg mb-4"
            />
            <h3 className="text-lg font-medium">{currentTrack.title}</h3>
            <p className="text-gray-400">{currentTrack.artist}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">{formatTime(progress * 30)}</span>
              <span className="text-xs text-gray-400">{formatTime(30 * 100)}</span>
            </div>
            <Slider
              value={[progress]}
              max={100}
              step={1}
              onValueChange={(value) => setProgress(value[0])}
              className="h-1"
            />
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={handlePrev}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={handleNext}>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Volume</span>
              <span className="text-xs text-gray-400">{volume}%</span>
            </div>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0])}
              className="h-1"
            />
          </div>

          <div className="mt-6 border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium mb-2">Up Next</h3>
            <div className="space-y-2">
              {SAMPLE_TRACKS.filter((track) => track.id !== currentTrack.id)
                .slice(0, 3)
                .map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      setCurrentTrack(track)
                      setProgress(0)
                      setIsPlaying(true)
                    }}
                  >
                    <img
                      src={track.albumArt || "/placeholder.svg"}
                      alt={track.title}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
