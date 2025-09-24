"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, ThumbsUp, Award, Heart, Star, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { UserCommendation } from "@/types/user-types"

interface CommendationModalProps {
  username: string
  onCommend: (commendation: Omit<UserCommendation, "id" | "timestamp">) => void
  onClose: () => void
}

type CommendationType = "friendly" | "helpful" | "funny" | "interesting" | "skilled"

export function CommendationModal({ username, onCommend, onClose }: CommendationModalProps) {
  const [selectedType, setSelectedType] = useState<CommendationType | null>(null)
  const [message, setMessage] = useState("")

  const handleCommend = () => {
    if (selectedType) {
      onCommend({
        type: selectedType,
        message: message.trim(),
      })
      onClose()
    }
  }

  const commendationTypes: Array<{
    type: CommendationType
    label: string
    icon: React.ReactNode
    color: string
  }> = [
    {
      type: "friendly",
      label: "Friendly",
      icon: <Heart className="h-5 w-5" />,
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      type: "helpful",
      label: "Helpful",
      icon: <Award className="h-5 w-5" />,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      type: "funny",
      label: "Funny",
      icon: <MessageCircle className="h-5 w-5" />,
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      type: "interesting",
      label: "Interesting",
      icon: <Star className="h-5 w-5" />,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      type: "skilled",
      label: "Skilled",
      icon: <ThumbsUp className="h-5 w-5" />,
      color: "bg-green-500 hover:bg-green-600",
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Commend {username}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <p className="mb-4 text-gray-400">What did you like about this person?</p>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {commendationTypes.map((type) => (
            <Button
              key={type.type}
              variant="default"
              className={`flex flex-col items-center gap-1 p-3 ${
                selectedType === type.type ? "ring-2 ring-white" : ""
              } ${type.color}`}
              onClick={() => setSelectedType(type.type)}
            >
              {type.icon}
              <span>{type.label}</span>
            </Button>
          ))}
        </div>

        <div className="mb-6">
          <Textarea
            placeholder="Add a personal message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-24 bg-gray-800 border-gray-700 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="text-black bg-white hover:bg-gray-200">
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleCommend}
            disabled={!selectedType}
            className="bg-green-500 hover:bg-green-600"
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Commend
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
