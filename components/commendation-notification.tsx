"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommendationNotificationProps {
  type: "commend" | "kick" | "received-commend"
  message: string
  onClose: () => void
}

export function CommendationNotification({ type, message, onClose }: CommendationNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  let icon, bgColor, textColor
  switch (type) {
    case "commend":
      icon = <Check className="h-4 w-4 mr-1" />
      bgColor = "bg-green-600"
      textColor = "text-white"
      break
    case "kick":
      icon = <X className="h-4 w-4 mr-1" />
      bgColor = "bg-red-600"
      textColor = "text-white"
      break
    case "received-commend":
      icon = <Check className="h-4 w-4 mr-1" />
      bgColor = "bg-yellow-500"
      textColor = "text-black"
      break
    default:
      icon = <Check className="h-4 w-4 mr-1" />
      bgColor = "bg-gray-600"
      textColor = "text-white"
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 animate-slideDown">
      <div className="flex items-start gap-3">
        <div className={cn("rounded-full p-2", bgColor)}>{icon}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <p className={cn("font-medium text-sm", textColor)}>{message}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
