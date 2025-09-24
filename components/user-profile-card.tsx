"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ReputationDisplay } from "@/components/reputation-display"
import { CommendationModal } from "@/components/commendation-modal"
import { Star, MessageSquare, Flag, User, Award, ThumbsUp, ThumbsDown } from "lucide-react"
import type { UserReputation, UserCommendation } from "@/types/user-types"

// Import the VoteButtons component
import { VoteButtons } from "@/components/vote-buttons"
import type { VoteType } from "@/lib/supabase-client"

interface UserProfileCardProps {
  userId: string
  username: string
  countryFlag: string
  countryName: string
  profileImage?: string
  reputation?: UserReputation
  currentUserId: string
  onCommend: (commendation: Omit<UserCommendation, "id" | "timestamp">) => void
  onKickVote: (reason: string) => void
  onClose: () => void
  onStartChat?: () => void
}

export function UserProfileCard({
  userId,
  username,
  countryFlag,
  countryName,
  profileImage,
  reputation,
  currentUserId,
  onCommend,
  onKickVote,
  onClose,
  onStartChat,
}: UserProfileCardProps) {
  const [showCommendModal, setShowCommendModal] = useState(false)

  const handleVote = (voteType: VoteType) => {
    // Handle vote based on type
    if (voteType === "up") {
      // You can trigger the commendation modal or directly commend
      setShowCommendModal(true)
    } else {
      // You can trigger the kick vote modal or directly kick
      onKickVote("Inappropriate behavior")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md border-gray-800 bg-gray-900 text-white">
        <CardHeader className="relative pb-0">
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4 h-8 w-8 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage || "/placeholder.svg"} alt={username} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-gray-500" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{username}</h2>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-xl">{countryFlag}</span>
                <span>{countryName}</span>
              </div>
              {reputation && (
                <div className="mt-2">
                  <ReputationDisplay reputation={reputation} />
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowCommendModal(true)}>
              <Star className="mr-2 h-4 w-4" />
              Commend
            </Button>
            {onStartChat ? (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onStartChat}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </Button>
            ) : (
              <Button
                variant="outline"
                className="border-red-800 text-red-500 hover:bg-red-950 hover:text-red-400"
                onClick={() => setShowCommendModal(true)}
              >
                <Flag className="mr-2 h-4 w-4" />
                Report
              </Button>
            )}
          </div>

          {/* Add VoteButtons component */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Rate this user
            </h3>
            <div className="flex justify-center">
              <VoteButtons targetUserId={userId} size="lg" showCounts={true} className="mt-2" />
            </div>
          </div>

          {reputation && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Reputation Level {reputation.level}
                </h3>
                <ReputationDisplay reputation={reputation} showDetails={true} />

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-sm font-medium">Positive</span>
                      </div>
                      <span className="text-lg font-bold text-green-500">{reputation.positiveRatings}</span>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
                        <span className="text-sm font-medium">Negative</span>
                      </div>
                      <span className="text-lg font-bold text-red-500">{reputation.negativeRatings}</span>
                    </div>
                  </div>
                </div>
              </div>

              {reputation.badges && reputation.badges.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {reputation.badges.map((badge, index) => (
                      <div key={index} className="bg-gray-700 rounded-full px-3 py-1 text-sm">
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showCommendModal && (
        <CommendationModal
          userId={userId}
          username={username}
          reputation={reputation}
          onCommend={onCommend}
          onKickVote={onKickVote}
          onClose={() => setShowCommendModal(false)}
          currentUserID={currentUserId}
        />
      )}
    </div>
  )
}
