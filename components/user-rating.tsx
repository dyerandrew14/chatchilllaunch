"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UserRating } from "@/types/user-types"

interface UserRatingProps {
  userId: string
  username: string
  onRate: (rating: Omit<UserRating, "id" | "timestamp">) => void
  onClose: () => void
  currentUserID: string
}

export function UserRating({ userId, username, onRate, onClose, currentUserID }: UserRatingProps) {
  const [selectedRating, setSelectedRating] = useState<"positive" | "negative" | null>(null)
  const [reason, setReason] = useState<string>("")
  const [reasonOptions, setReasonOptions] = useState<string[]>([])

  const handleRatingSelect = (type: "positive" | "negative") => {
    setSelectedRating(type)

    if (type === "positive") {
      setReasonOptions(["Friendly", "Helpful", "Interesting", "Funny", "Good conversation"])
    } else {
      setReasonOptions(["Inappropriate", "Rude", "Spam", "Offensive language", "Unwanted advances"])
    }

    setReason("")
  }

  const handleSubmit = () => {
    onRate({
      fromUserId: currentUserID,
      toUserId: userId,
      isPositive: selectedRating === "positive",
      reason: reason,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Rate {username}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <Button
            onClick={() => handleRatingSelect("positive")}
            className={cn(
              "flex-1 h-16 flex flex-col items-center justify-center gap-2 rounded-lg",
              selectedRating === "positive"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300",
            )}
          >
            <ThumbsUp className={cn("h-6 w-6", selectedRating === "positive" ? "text-white" : "text-gray-400")} />
            <span>Positive</span>
          </Button>

          <Button
            onClick={() => handleRatingSelect("negative")}
            className={cn(
              "flex-1 h-16 flex flex-col items-center justify-center gap-2 rounded-lg",
              selectedRating === "negative"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300",
            )}
          >
            <ThumbsDown className={cn("h-6 w-6", selectedRating === "negative" ? "text-white" : "text-gray-400")} />
            <span>Negative</span>
          </Button>
        </div>

        {selectedRating && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Reason (optional)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {reasonOptions.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    onClick={() => setReason(option)}
                    className={cn(
                      "border-gray-700 hover:bg-gray-800",
                      reason === option &&
                        (selectedRating === "positive"
                          ? "bg-green-900/30 border-green-700"
                          : "bg-red-900/30 border-red-700"),
                    )}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {selectedRating === "negative" && (
              <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-900/30 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-200">
                  Users who receive multiple negative ratings may be temporarily restricted from certain interest
                  groups.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={onClose} className="border-gray-700 hover:bg-gray-800">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className={
                  selectedRating === "positive" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }
              >
                Submit Rating
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
