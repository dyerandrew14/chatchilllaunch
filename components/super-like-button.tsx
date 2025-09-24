"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VipFeature } from "@/components/vip-feature"

interface SuperLikeButtonProps {
  username: string
  isVIP: boolean
  freeSuperLikes: number
  onSuperLike: (username: string) => void
  onUpgrade: () => void
  onUseFreeSuper: () => void
}

export function SuperLikeButton({
  username,
  isVIP,
  freeSuperLikes,
  onSuperLike,
  onUpgrade,
  onUseFreeSuper,
}: SuperLikeButtonProps) {
  const [isSent, setIsSent] = useState(false)
  const [showFreeCount, setShowFreeCount] = useState(false)

  useEffect(() => {
    // Show free count for non-VIP users with free super likes
    setShowFreeCount(!isVIP && freeSuperLikes > 0)
  }, [isVIP, freeSuperLikes])

  const handleSuperLike = () => {
    onSuperLike(username)
    setIsSent(true)

    if (!isVIP && freeSuperLikes > 0) {
      onUseFreeSuper()
    }

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSent(false)
    }, 3000)
  }

  // Button component that will be passed to VipFeature
  const buttonComponent = (
    <div className="relative">
      <Button
        variant="outline"
        size="lg"
        className={`flex items-center justify-center ${
          isSent ? "bg-pink-600 text-white" : "bg-black/50 hover:bg-pink-900/30 border-pink-600 backdrop-blur-sm"
        } rounded-full h-16 w-16 p-0`}
        onClick={isVIP || freeSuperLikes > 0 ? handleSuperLike : undefined}
        disabled={isSent}
      >
        <Heart className={`h-8 w-8 ${isSent ? "fill-white text-white" : "fill-pink-600 text-pink-600"}`} />
        <span className="sr-only">{isSent ? "Super Liked!" : "Super Like"}</span>
      </Button>

      {showFreeCount && (
        <div className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {freeSuperLikes}
        </div>
      )}
    </div>
  )

  // If user is VIP or has free super likes, just return the button
  if (isVIP || freeSuperLikes > 0) {
    return buttonComponent
  }

  // Otherwise wrap in VipFeature
  return (
    <VipFeature isVIP={isVIP} onUpgrade={onUpgrade} title="Send a Super Like" buttonComponent={buttonComponent}>
      {buttonComponent}
    </VipFeature>
  )
}
