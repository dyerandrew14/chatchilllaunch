"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Compass, Gamepad2, Music, Film, Trophy, Cpu, Palette, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"

// Update the Interest type to include an icon component
export interface Interest {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  description?: string
}

// Update the interests array to include unique icons for each interest
const interests: Interest[] = [
  {
    id: "general",
    name: "General",
    icon: <Compass className="h-5 w-5 text-white" />,
    color: "from-blue-500 to-blue-700",
    description: "Chat about anything with people from around the world",
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: <Gamepad2 className="h-5 w-5 text-white" />,
    color: "from-green-500 to-green-700",
    description: "Connect with fellow gamers and discuss your favorite games",
  },
  {
    id: "music",
    name: "Music",
    icon: <Music className="h-5 w-5 text-white" />,
    color: "from-purple-500 to-purple-700",
    description: "Share your music taste and discover new artists",
  },
  {
    id: "movies",
    name: "Movies",
    icon: <Film className="h-5 w-5 text-white" />,
    color: "from-red-500 to-red-700",
    description: "Discuss films, TV shows, and entertainment",
  },
  {
    id: "sports",
    name: "Sports",
    icon: <Trophy className="h-5 w-5 text-white" />,
    color: "from-yellow-500 to-yellow-700",
    description: "Talk about sports, teams, and athletic events",
  },
  {
    id: "tech",
    name: "Tech",
    icon: <Cpu className="h-5 w-5 text-white" />,
    color: "from-cyan-500 to-cyan-700",
    description: "Discuss technology, gadgets, and innovations",
  },
  {
    id: "art",
    name: "Art",
    icon: <Palette className="h-5 w-5 text-white" />,
    color: "from-orange-500 to-orange-700",
    description: "Connect with artists and art enthusiasts",
  },
  {
    id: "dating",
    name: "Speed Dating",
    icon: <Heart className="h-5 w-5 text-white" />,
    color: "from-pink-500 to-pink-700",
    description: "Meet new people for dating and relationships",
  },
]

interface InterestSelectorProps {
  onSelect: (interest: Interest) => void
  onClose: () => void
}

export function InterestSelector({ onSelect, onClose }: InterestSelectorProps) {
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null)
  const [isHovering, setIsHovering] = useState<string | null>(null)

  const handleSelect = (interest: Interest) => {
    setSelectedInterest(interest)
    // Add a small delay before closing to ensure state is updated
    setTimeout(() => {
      onSelect(interest)
    }, 100)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-4xl rounded-xl bg-gray-900 border border-gray-800 shadow-2xl"
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="ChatChill Logo" width={160} height={64} className="h-14 w-auto mr-3" />
            <h2 className="text-xl font-medium text-white">Select Your Interest</h2>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          {interests.map((interest) => (
            <motion.div
              key={interest.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300",
                selectedInterest?.id === interest.id ? "ring-2 ring-yellow-500 ring-offset-2 ring-offset-gray-900" : "",
                isHovering === interest.id ? "shadow-lg" : "",
              )}
              onClick={() => handleSelect(interest)}
              onMouseEnter={() => setIsHovering(interest.id)}
              onMouseLeave={() => setIsHovering(null)}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", interest.color)} />
              <div className="relative p-6 flex flex-col items-center text-center">
                <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm mb-3">{interest.icon}</div>
                <h3 className="font-bold text-white mb-1">{interest.name}</h3>
                <p className="text-xs text-white/80 mb-2">{interest.description}</p>
                {interest.activeUsers && (
                  <div className="text-xs bg-black/30 px-2 py-1 rounded-full text-white/90 backdrop-blur-sm">
                    {interest.activeUsers} active users
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center p-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Skip for now
          </button>

          <div className="text-sm text-gray-400">
            <span className="text-yellow-500 font-medium">Pro tip:</span> Choose an interest to find better matches
          </div>
        </div>
      </motion.div>
    </div>
  )
}
