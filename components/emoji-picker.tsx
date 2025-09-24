"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"

// Common emojis for quick access
const COMMON_EMOJIS = [
  "😀",
  "😂",
  "🤣",
  "😊",
  "🥰",
  "😍",
  "🤩",
  "😎",
  "👍",
  "👋",
  "🙌",
  "👏",
  "🔥",
  "❤️",
  "💯",
  "🎉",
  "🤔",
  "🙄",
  "😬",
  "😭",
  "😱",
  "🥺",
  "😴",
  "🤮",
]

// Meme URLs - in a real app, these would come from an API
const MEMES = [
  "https://i.imgur.com/DJBBUS0.jpeg",
  "https://i.imgur.com/YLyEJB7.jpeg",
  "https://i.imgur.com/1p8ZTcG.jpeg",
  "https://i.imgur.com/vEPF2j1.jpeg",
  "https://i.imgur.com/uPZyA9v.png",
  "https://i.imgur.com/P5DLvpe.jpeg",
]

interface EmojiPickerProps {
  onSelect: (content: string, type: "emoji" | "meme") => void
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"emoji" | "meme">("emoji")
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (content: string, type: "emoji" | "meme") => {
    onSelect(content, type)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={pickerRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full bg-gray-700 hover:bg-gray-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Smile className="h-5 w-5 text-gray-300" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden z-10">
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === "emoji" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700"}`}
              onClick={() => setActiveTab("emoji")}
            >
              Emojis
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === "meme" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700"}`}
              onClick={() => setActiveTab("meme")}
            >
              Memes
            </button>
          </div>

          <div className="p-2 max-h-60 overflow-y-auto">
            {activeTab === "emoji" ? (
              <div className="grid grid-cols-6 gap-1">
                {COMMON_EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    className="h-8 w-8 flex items-center justify-center text-lg hover:bg-gray-700 rounded"
                    onClick={() => handleSelect(emoji, "emoji")}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {MEMES.map((url, index) => (
                  <button
                    key={index}
                    className="h-20 overflow-hidden rounded hover:opacity-80"
                    onClick={() => handleSelect(url, "meme")}
                  >
                    <img src={url || "/placeholder.svg"} alt="Meme" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
