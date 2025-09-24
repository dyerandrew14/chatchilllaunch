"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface FriendRequestNotificationProps {
  friendName: string
  onAccept: () => void
  onDecline: () => void
}

export function FriendRequestNotification({ friendName, onAccept, onDecline }: FriendRequestNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-20 right-4 z-50 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 animate-slide-in">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
          {friendName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">Friend Request</h4>
          <p className="text-sm text-gray-400 mb-3">{friendName} wants to chat with you</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                onAccept()
                setIsVisible(false)
              }}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 hover:bg-gray-700"
              onClick={() => {
                onDecline()
                setIsVisible(false)
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
