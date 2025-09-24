"use client"

import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function AuthDebug() {
  const { session, user, profile, isLoading, isProfileLoading, error, refreshProfile } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm"
      >
        {isExpanded ? "Hide Debug" : "Show Debug"}
      </button>

      {isExpanded && (
        <div className="mt-2 bg-gray-900 p-4 rounded-md text-white text-xs w-80 max-h-96 overflow-auto">
          <h3 className="font-bold mb-2">Auth Debug</h3>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Loading:</span> {isLoading ? "true" : "false"}
            </div>
            <div>
              <span className="font-semibold">Profile Loading:</span> {isProfileLoading ? "true" : "false"}
            </div>
            <div>
              <span className="font-semibold">Error:</span> {error || "none"}
            </div>
            <div>
              <span className="font-semibold">Session:</span>{" "}
              {session ? `${session.user.id} (${session.user.email})` : "null"}
            </div>
            <div>
              <span className="font-semibold">User:</span> {user ? `${user.id} (${user.email})` : "null"}
            </div>
            <div>
              <span className="font-semibold">Profile:</span> {profile ? `${profile.username}` : "null"}
            </div>
            {profile && (
              <div>
                <span className="font-semibold">Profile Details:</span>
                <pre className="mt-1 bg-gray-800 p-2 rounded overflow-x-auto">{JSON.stringify(profile, null, 2)}</pre>
              </div>
            )}
            <Button
              onClick={() => refreshProfile()}
              className="mt-2 bg-yellow-500 text-black hover:bg-yellow-600 text-xs py-1"
            >
              Refresh Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
