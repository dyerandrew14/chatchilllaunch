"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { AuthModal } from "@/components/auth-modal"
import { LoadingSpinner } from "@/components/loading-spinner"
// Import all your other components and hooks
import { Sidebar } from "@/components/sidebar"

interface ChatChillComponentProps {
  onLoginClick: () => void
}

export default function ChatChillComponent({ onLoginClick }: ChatChillComponentProps) {
  const { session, user, profile, isLoading, isProfileLoading } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [componentReady, setComponentReady] = useState(false)
  const supabase = createClientComponentClient()

  // All your existing state variables and hooks
  // ...
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [microphoneVolume, setMicrophoneVolume] = useState(80)
  const [speakerVolume, setSpeakerVolume] = useState(80)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [userState, setUserState] = useState<{
    username?: string | null
    email?: string | null
    isLoggedIn: boolean
    profileImage?: string
    country?: string | null
    isVIP: boolean
    subscriptionDate?: string | null
    instagram?: string | null
    snapchat?: string | null
    facebook?: string | null
    discord?: string | null
  } | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isVip, setIsVip] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [showDatingList, setShowDatingList] = useState(false)

  // Mark component as ready after a short delay
  useEffect(() => {
    console.log("ChatChillComponent mounted")

    // Short delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setComponentReady(true)
      console.log("ChatChillComponent ready")
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const clearDebugLogs = () => {
    setDebugLogs([])
  }

  const handleLogoutSuccess = () => {
    setUserState(null)
    setIsLoggedIn(false)
    setIsVip(false)
  }

  // Update the startChat function to include authentication
  const startChat = async () => {
    // Check if user is authenticated
    if (!session) {
      console.log("User not authenticated, showing login modal")
      onLoginClick()
      return
    }

    // Rest of your startChat logic
    // ...

    try {
      // When making the match API call, include the session token
      const matchResponse = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hasVideo: true, // or your hasVideo state
        }),
      })

      if (!matchResponse.ok) {
        // Handle authentication errors
        if (matchResponse.status === 401) {
          console.log("Authentication required for matchmaking")
          onLoginClick()
          return
        }

        // Handle other errors
        throw new Error(`Match API error: ${matchResponse.status}`)
      }

      // Rest of your code for handling the match response
      // ...
    } catch (error) {
      console.error("Error in startChat:", error)
      // Handle errors appropriately
    }
  }

  // Convert profile to the user format your UI expects - SAFELY
  useEffect(() => {
    if (!session || !profile || !componentReady) {
      return
    }

    console.log("Updating user state from profile:", profile)

    // Only update user state when we have both session and profile
    setUserState({
      username: profile.username,
      email: user?.email,
      isLoggedIn: true,
      profileImage: profile.avatar_url || undefined,
      country: profile.country,
      isVIP: profile.is_vip || false,
      subscriptionDate: profile.subscription_date,
      instagram: profile.instagram,
      snapchat: profile.snapchat,
      facebook: profile.facebook,
      discord: profile.discord,
      // Add other fields as needed
    })

    setIsLoggedIn(true)
    if (profile.is_vip) {
      setIsVip(true)
    }
  }, [profile, user, session, componentReady])

  // If still loading, don't render anything yet
  if (isLoading || isProfileLoading || !componentReady) {
    return <LoadingSpinner />
  }

  // If no session or profile, don't render the component
  if (!session || !profile) {
    return null
  }

  // Rest of your component logic
  // ...

  return (
    <>
      {/* Your existing UI */}
      {/* Make sure to use the session/profile state for conditional rendering */}
      {/* For example, in the sidebar: */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={userState}
        onLogout={handleLogoutSuccess}
        microphoneVolume={microphoneVolume}
        speakerVolume={speakerVolume}
        onMicrophoneVolumeChange={setMicrophoneVolume}
        onSpeakerVolumeChange={setSpeakerVolume}
        debugLogs={debugLogs}
        clearDebugLogs={clearDebugLogs}
        onEditProfile={() => (profile ? setIsProfileModalOpen(true) : onLoginClick())}
        onOpenDatingList={() => setShowDatingList(true)}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
