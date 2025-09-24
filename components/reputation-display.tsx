import { Star, Award, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserReputation, UserBadge } from "@/types/user-types"
import { REPUTATION_LEVELS } from "@/types/user-types"

interface ReputationDisplayProps {
  reputation: UserReputation
  size?: "sm" | "md" | "lg"
  showDetails?: boolean
  className?: string
}

export function ReputationDisplay({ reputation, size = "md", showDetails = false, className }: ReputationDisplayProps) {
  const currentLevel = REPUTATION_LEVELS.find((level) => level.level === reputation.level) || REPUTATION_LEVELS[0]
  const nextLevel = REPUTATION_LEVELS.find((level) => level.level === reputation.level + 1)

  const progressToNextLevel = nextLevel
    ? Math.min(
        100,
        Math.round(
          ((reputation.points - currentLevel.pointsRequired) /
            (nextLevel.pointsRequired - currentLevel.pointsRequired)) *
            100,
        ),
      )
    : 100

  // Map color names to Tailwind classes
  const getColorClass = (color: string) => {
    switch (color) {
      case "gray":
        return "text-gray-400 bg-gray-800"
      case "blue":
        return "text-blue-400 bg-blue-900/30"
      case "green":
        return "text-green-400 bg-green-900/30"
      case "purple":
        return "text-purple-400 bg-purple-900/30"
      case "yellow":
        return "text-yellow-400 bg-yellow-900/30"
      case "red":
        return "text-red-400 bg-red-900/30"
      default:
        return "text-gray-400 bg-gray-800"
    }
  }

  const levelColorClass = getColorClass(currentLevel.color)
  const progressBarColorClass = `bg-${currentLevel.color}-600`

  return (
    <div className={cn("flex items-center", showDetails ? "flex-col" : "", className)}>
      <div
        className={cn("flex items-center gap-1.5", size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm")}
      >
        <div
          className={cn(
            "rounded-full flex items-center justify-center",
            levelColorClass,
            size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6",
          )}
        >
          <Star className={size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
        </div>
        <span className={cn("font-medium", `text-${currentLevel.color}-500`)}>{currentLevel.name}</span>
        {size !== "sm" && <span className="text-gray-400">Lvl {reputation.level}</span>}
      </div>

      {showDetails && (
        <div className="w-full mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">{reputation.points} points</span>
            {nextLevel && (
              <span className="text-gray-400">
                Next: {nextLevel.name} ({nextLevel.pointsRequired - reputation.points} needed)
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className={progressBarColorClass} style={{ width: `${progressToNextLevel}%`, height: "100%" }}></div>
          </div>

          {reputation.badges.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Award className="h-4 w-4 mr-1.5 text-yellow-500" />
                Badges
              </h4>
              <div className="flex flex-wrap gap-2">
                {reputation.badges.map((badge) => (
                  <BadgeDisplay key={badge.id} badge={badge} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-green-500">{reputation.positiveRatings}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="text-red-500">{reputation.negativeRatings}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface BadgeDisplayProps {
  badge: UserBadge
}

function BadgeDisplay({ badge }: BadgeDisplayProps) {
  return (
    <div className="px-2 py-1 bg-gray-800 rounded-full flex items-center gap-1.5 text-xs">
      <span className="text-yellow-500">{badge.icon}</span>
      <span className="text-gray-300">{badge.name}</span>
    </div>
  )
}
