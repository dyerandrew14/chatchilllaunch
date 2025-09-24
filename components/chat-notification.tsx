"use client"

import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface ChatNotificationProps {
  message: string
  sender: string
  onOpen: () => void
  onDismiss: () => void
  autoDismiss?: boolean
  dismissTimeout?: number
}

export function ChatNotification({
  message,
  sender,
  onOpen,
  onDismiss,
  autoDismiss = true,
  dismissTimeout = 3000, // Changed from 5000 to 3000
}: ChatNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss()
      }, dismissTimeout)

      return () => clearTimeout(timer)
    }
  }, [autoDismiss, dismissTimeout, onDismiss])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3 w-[90%] max-w-sm z-50 animate-slideUp">
      <div className="flex items-start gap-3">
        <div className="bg-gray-700 rounded-full p-2">
          <MessageCircle className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <p className="font-medium text-sm">{sender}</p>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-300 line-clamp-2">{message}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7 text-xs text-yellow-500 hover:text-yellow-400 p-0"
            onClick={onOpen}
          >
            Open Chat
          </Button>
        </div>
      </div>
    </div>
  )
}
