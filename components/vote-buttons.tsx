"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVotes } from "@/hooks/use-votes"
import type { VoteType } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"

interface VoteButtonsProps {
  targetUserId: string
  onVote?: (voteType: VoteType) => void
  size?: "sm" | "md" | "lg"
  showCounts?: boolean
  className?: string
}

export function VoteButtons({
  targetUserId,
  onVote,
  size = "md",
  showCounts = true,
  className = "",
}: VoteButtonsProps) {
  const { toast } = useToast()
  const [isVoting, setIsVoting] = useState(false)

  const { isLoading, userVote, voteCounts, submitVote, isAuthenticated } = useVotes({
    targetUserId,
    onVoteSuccess: (voteType) => {
      setIsVoting(false)
      onVote?.(voteType)
      toast({
        title: voteType === "up" ? "Upvoted!" : "Downvoted!",
        description:
          voteType === "up" ? "You gave this user a positive rating." : "You gave this user a negative rating.",
        variant: voteType === "up" ? "default" : "destructive",
      })
    },
    onVoteError: (error) => {
      setIsVoting(false)
      toast({
        title: "Vote Error",
        description: error,
        variant: "destructive",
      })
    },
  })

  const handleVote = async (voteType: VoteType) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to vote.",
        variant: "destructive",
      })
      return
    }

    setIsVoting(true)
    await submitVote(voteType)
  }

  // Size classes
  const buttonSizeClass = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10"

  const iconSizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"

  const countSizeClass = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className={`${buttonSizeClass} rounded-full ${userVote === "up" ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          onClick={() => handleVote("up")}
          disabled={isLoading || isVoting}
        >
          {isVoting && userVote !== "up" ? (
            <Loader2 className={`${iconSizeClass} animate-spin`} />
          ) : (
            <ThumbsUp className={iconSizeClass} />
          )}
        </Button>
        {showCounts && (
          <span
            className={`${countSizeClass} mt-1 font-medium ${userVote === "up" ? "text-green-500" : "text-gray-400"}`}
          >
            {voteCounts.upvotes}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className={`${buttonSizeClass} rounded-full ${userVote === "down" ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          onClick={() => handleVote("down")}
          disabled={isLoading || isVoting}
        >
          {isVoting && userVote !== "down" ? (
            <Loader2 className={`${iconSizeClass} animate-spin`} />
          ) : (
            <ThumbsDown className={iconSizeClass} />
          )}
        </Button>
        {showCounts && (
          <span
            className={`${countSizeClass} mt-1 font-medium ${userVote === "down" ? "text-red-500" : "text-gray-400"}`}
          >
            {voteCounts.downvotes}
          </span>
        )}
      </div>
    </div>
  )
}
