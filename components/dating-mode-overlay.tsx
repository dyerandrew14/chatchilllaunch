"use client"

import { Heart, Sparkles } from "lucide-react"

interface DatingModeOverlayProps {
  isVIP: boolean
}

export function DatingModeOverlay({ isVIP }: DatingModeOverlayProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-pink-500/20 to-transparent h-24 pointer-events-none">
      <div className="flex items-center justify-center p-2">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
          <Heart className="h-5 w-5 text-pink-500" />
          <span className="text-white font-medium">Dating Mode</span>
          {isVIP && <Sparkles className="h-4 w-4 text-yellow-400 ml-1" />}
        </div>
      </div>
    </div>
  )
}
