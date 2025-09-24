"use client"

import { useState, useEffect } from "react"
import { supabase, type VoteType } from "@/lib/supabase-client"

interface UseVotesProps {
  targetUserId: string
  onVoteSuccess?: (voteType: VoteType) => void
  onVoteError?: (error: string) => void
}

export function useVotes({ targetUserId, onVoteSuccess, onVoteError }: UseVotesProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userVote, setUserVote] = useState<VoteType | null>(null)
  const [voteCounts, setVoteCounts] = useState({ upvotes: 0, downvotes: 0 })

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setIsAuthenticated(true)
        setUserId(data.session.user.id)
      } else {
        setIsAuthenticated(false)
        setUserId(null)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true)
        setUserId(session.user.id)
      } else {
        setIsAuthenticated(false)
        setUserId(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Fetch user's vote and vote counts
  useEffect(() => {
    const fetchVoteData = async () => {
      setIsLoading(true)

      try {
        // Only fetch user's vote if authenticated
        if (isAuthenticated && userId) {
          const { data: userVoteData, error: userVoteError } = await supabase
            .from("votes")
            .select("vote_type")
            .eq("user_id", userId)
            .eq("target_user_id", targetUserId)
            .single()

          if (!userVoteError && userVoteData) {
            setUserVote(userVoteData.vote_type as VoteType)
          } else if (userVoteError && userVoteError.code !== "PGRST116") {
            console.error("Error fetching user vote:", userVoteError)
          }
        }

        // Fetch vote counts regardless of authentication
        const { count: upvotes } = await supabase
          .from("votes")
          .select("*", { count: "exact", head: true })
          .eq("target_user_id", targetUserId)
          .eq("vote_type", "up")

        const { count: downvotes } = await supabase
          .from("votes")
          .select("*", { count: "exact", head: true })
          .eq("target_user_id", targetUserId)
          .eq("vote_type", "down")

        setVoteCounts({
          upvotes: upvotes || 0,
          downvotes: downvotes || 0,
        })
      } catch (error) {
        console.error("Error fetching vote data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (targetUserId) {
      fetchVoteData()
    }
  }, [targetUserId, isAuthenticated, userId])

  // Submit a vote
  const submitVote = async (voteType: VoteType) => {
    if (!isAuthenticated || !userId) {
      onVoteError?.("You must be logged in to vote")
      return
    }

    try {
      const now = new Date().toISOString()

      // Check if user has already voted
      if (userVote) {
        // Update existing vote
        const { error } = await supabase
          .from("votes")
          .update({
            vote_type: voteType,
            updated_at: now,
          })
          .eq("user_id", userId)
          .eq("target_user_id", targetUserId)

        if (error) throw error
      } else {
        // Create new vote
        const { error } = await supabase.from("votes").insert({
          user_id: userId,
          target_user_id: targetUserId,
          vote_type: voteType,
          created_at: now,
          updated_at: now,
        })

        if (error) throw error
      }

      // Update local state
      setUserVote(voteType)

      // Update vote counts
      setVoteCounts((prev) => {
        const newCounts = { ...prev }

        // If changing vote from up to down or vice versa
        if (userVote && userVote !== voteType) {
          if (voteType === "up") {
            newCounts.upvotes += 1
            newCounts.downvotes = Math.max(0, newCounts.downvotes - 1)
          } else {
            newCounts.downvotes += 1
            newCounts.upvotes = Math.max(0, newCounts.upvotes - 1)
          }
        }
        // If new vote
        else if (!userVote) {
          if (voteType === "up") {
            newCounts.upvotes += 1
          } else {
            newCounts.downvotes += 1
          }
        }

        return newCounts
      })

      onVoteSuccess?.(voteType)
    } catch (error) {
      console.error("Error submitting vote:", error)
      onVoteError?.("Failed to submit vote. Please try again.")
    }
  }

  return {
    isLoading,
    isAuthenticated,
    userVote,
    voteCounts,
    submitVote,
  }
}
