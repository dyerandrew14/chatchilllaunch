export interface UserBadge {
  id: string
  name: string
  icon: string
  description: string
  dateEarned: Date
}

export interface InterestGroupBan {
  interestId: string
  interestName: string
  reason: string
  expiresAt: Date | null
}

export const REPUTATION_LEVELS = [
  { level: 1, name: "Newcomer", pointsRequired: 0, color: "gray" },
  { level: 2, name: "Regular", pointsRequired: 50, color: "blue" },
  { level: 3, name: "Trusted", pointsRequired: 150, color: "green" },
  { level: 4, name: "Respected", pointsRequired: 300, color: "purple" },
  { level: 5, name: "Elite", pointsRequired: 500, color: "yellow" },
  { level: 6, name: "Legendary", pointsRequired: 1000, color: "red" },
]

export interface UserReputation {
  level: number
  points: number
  positiveRatings: number
  negativeRatings: number
  badges: UserBadge[]
  interestGroupBans: InterestGroupBan[]
}

export interface UserRating {
  id: string
  fromUserId: string
  toUserId: string
  isPositive: boolean
  reason?: string
  timestamp: Date
}

export type CommendationType = "friendly" | "helpful" | "funny" | "skilled" | "creative"

export interface UserCommendation {
  id: string
  fromUserId: string
  toUserId: string
  type: CommendationType
  message?: string
  timestamp: Date
}

export interface KickVote {
  id: string
  targetUserId: string
  reason: "inappropriate" | "spam" | "harassment" | "offensive" | "other"
  votes: string[] // array of user IDs who voted
  requiredVotes: number
  expiresAt: Date
  active: boolean
}

export type BadgeType = 
  | "Newcomer" 
  | "Regular" 
  | "Veteran" 
  | "Friendly" 
  | "Helpful" 
  | "Funny" 
  | "Skilled" 
  | "Creative" 
  | "Popular" 
  | "Respected"
