"use client"

import type React from "react"
import { useState } from "react"
import { Lock, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VipFeatureProps {
  isVIP: boolean
  onUpgrade: () => void
  children: React.ReactNode
  title: string
  buttonComponent: React.ReactNode
}

export function VipFeature({ isVIP, onUpgrade, children, title, buttonComponent }: VipFeatureProps) {
  const [showOverlay, setShowOverlay] = useState(false)

  if (isVIP) {
    return <>{children}</>
  }

  const handleClick = () => {
    setShowOverlay(true)
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Pass through the button click to show overlay */}
      <div className="cursor-pointer" onClick={handleClick}>
        {buttonComponent}
      </div>

      {/* VIP overlay - only shown when clicked */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowOverlay(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-yellow-500 rounded-full p-2 mx-auto w-fit mb-4 animate-pulse">
              <Lock className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2 text-center">{title}</h3>
            <p className="text-gray-300 mb-6 text-center">This is a VIP-only feature</p>
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-medium"
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to VIP
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
