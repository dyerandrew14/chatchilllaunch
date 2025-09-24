"use client"

import { useState } from "react"
import { Heart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VoteButtons } from "@/components/vote-buttons"
import type { VoteType } from "@/lib/supabase-client"

interface VideoOverlayActionsProps {
  onThumbsUp: () => void
  onThumbsDown: () => void
  onViewProfile: () => void
  onSuperLike?: (username: string) => void
  onUpgrade: () => void
  onUseFreeSuper: () => void
  username: string
  isVIP: boolean
  freeSuperLikes: number
  isDatingMode?: boolean
  targetUserId: string
}

export function VideoOverlayActions({
  onThumbsUp,
  onThumbsDown,
  onViewProfile,
  onSuperLike,
  onUpgrade,
  onUseFreeSuper,
  username,
  isVIP,
  freeSuperLikes,
  isDatingMode = false,
  targetUserId,
}: VideoOverlayActionsProps) {
  const [showSuperLikeConfirm, setShowSuperLikeConfirm] = useState(false)

  const handleVote = (voteType: VoteType) => {
    if (voteType === "up") {
      onThumbsUp()
    } else {
      onThumbsDown()
    }
  }

  const handleSuperLike = () => {
    if (isVIP || freeSuperLikes > 0) {
      setShowSuperLikeConfirm(true)
    } else {
      onUpgrade()
    }
  }

  const confirmSuperLike = () => {
    if (!isVIP) {
      onUseFreeSuper()
    }
    onSuperLike?.(username)
    setShowSuperLikeConfirm(false)
  }

  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
      {/* Super Like button - only in dating mode */}
      {isDatingMode && onSuperLike && (
        <div className="relative">
          {showSuperLikeConfirm ? (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-black/70 p-2 backdrop-blur-sm">
              <span className="text-sm text-white">Super Like {username}?</span>
              <Button size="sm" className="h-8 bg-pink-500 hover:bg-pink-600 text-white" onClick={confirmSuperLike}>
                Yes
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={() => setShowSuperLikeConfirm(false)}
              >
                No
              </Button>
            </div>
          ) : (
            <Button
              className="h-10 w-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white"
              size="icon"
              onClick={handleSuperLike}
            >
              <Heart className="h-5 w-5" />
              {!isVIP && freeSuperLikes > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black">
                  {freeSuperLikes}
                </span>
              )}
            </Button>
          )}
        </div>
      )}

      {/* View profile button */}
      <Button
        className="h-10 w-10 rounded-full bg-gray-800 hover:bg-gray-700 text-white"
        size="icon"
        onClick={onViewProfile}
      >
        <User className="h-5 w-5" />
      </Button>

      {/* Vote buttons */}
      <VoteButtons targetUserId={targetUserId} onVote={handleVote} size="md" showCounts={false} className="flex-row" />
    </div>
  )
}
