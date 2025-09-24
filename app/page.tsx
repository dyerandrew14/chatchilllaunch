"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import type React from "react"
import {
  Crown,
  Menu,
  MessageSquare,
  Compass,
  Users2,
  Heart,
  Music,
  Film,
  Trophy,
  Cpu,
  Palette,
  Gamepad2,
  Users,
  ChevronDown,
  ChevronUp,
  UserIcon as Male,
  UserIcon as Female,
  SkipForward,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { EmojiPicker } from "@/components/emoji-picker"
import { COUNTRIES, SAMPLE_TRACKS } from "@/lib/constants"
import { CameraView } from "@/components/camera-view"
import type { Interest } from "@/components/interest-selector"
import type { UserReputation, UserCommendation } from "@/types/user-types"
import { ReputationDisplay } from "@/components/reputation-display"
import { CommendationNotification } from "@/components/commendation-notification"
import { ThumbsAnimation } from "@/components/thumbs-animation"
import { VideoOverlayActions } from "@/components/video-overlay-actions"
import { Sidebar } from "@/components/sidebar"
import { DatingModeOverlay } from "@/components/dating-mode-overlay"
import { DatingThemeProvider } from "@/components/dating-theme-provider"
import { InterestSelector } from "@/components/interest-selector"
import { UserProfileCard } from "@/components/user-profile-card"
import { CameraAccessDenied } from "@/components/camera-access-denied"
import { VipPopup } from "@/components/vip-popup"
import { LoadingSpinner } from "@/components/loading-spinner"
import dynamic from "next/dynamic"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
// Add this import at the top of the file with the other imports
import { ProfileModal } from "@/components/profile-modal"
import { AuthModal } from "@/components/auth-modal"

// Dynamically import the ChatChillComponent with no SSR
const ChatChillComponent = dynamic(() => import("@/components/chat-chill"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
})

type Message = {
  id: string
  text: string
  sender: "me" | "stranger"
  timestamp: Date
  username?: string
  isMusic?: boolean
  isEmoji?: boolean
  isMeme?: boolean
  isImage?: boolean
  musicData?: {
    title: string
    artist: string
    albumArt?: string
  }
  memeUrl?: string
  imageUrl?: string
}

// Update the User type to include reputation
type UserType = {
  username: string
  email?: string
  instagram?: string
  snapchat?: string
  facebook?: string
  discord?: string
  isLoggedIn: boolean
  profileImage?: string
  country?: string
  countryFlag?: string
  countryName?: string
  isVIP?: boolean
  subscriptionDate?: string
  reputation?: UserReputation
}

type Friend = {
  id: string
  name: string
  online: boolean
}

type FriendRequest = {
  id: string
  name: string
}

type Gender = "male" | "female" | "any"

type ChatNotificationType = {
  id: string
  message: string
  sender: string
}

// Dating match type
type DatingMatch = {
  id: string
  name: string
  profileImage?: string
  country?: string
  countryFlag?: string
  matchDate: string
  lastMessage?: string
  online: boolean
}

// Main component
export default function HomePage() {
  const { user: authUser, profile: authProfile, signOut } = useAuth()
  const isMobile = useMobile()
  const supabase = createClientComponentClient()

  // State for auth modal
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  // All useState hooks
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [peopleSkipped, setPeopleSkipped] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [user, setUser] = useState<UserType | null>(null)
  const [strangerUsername, setStrangerUsername] = useState("Stranger")
  const [strangerCountry, setStrangerCountry] = useState(COUNTRIES[0])
  const [channelName, setChannelName] = useState("")
  const [userId, setUserId] = useState<number>(0)
  const [friends, setFriends] = useState<Friend[]>([])
  const [showFriends, setShowFriends] = useState(false)
  const [inviteFriendId, setInviteFriendId] = useState<string | null>(null)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showMusicPanel, setShowMusicPanel] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<(typeof SAMPLE_TRACKS)[0] | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [myVolume, setMyVolume] = useState(80)
  const [strangerVolume, setStrangerVolume] = useState(80)
  const [microphoneVolume, setMicrophoneVolume] = useState(80)
  const [speakerVolume, setSpeakerVolume] = useState(80)
  const [onlineUsers, setOnlineUsers] = useState(Math.floor(Math.random() * 4000) + 500)
  const [selectedGender, setSelectedGender] = useState<Gender>("any")
  const [showWaitingScreen, setShowWaitingScreen] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [pendingFriendRequest, setPendingFriendRequest] = useState<FriendRequest | null>(null)
  const [showChat, setShowChat] = useState(true) // Default to true for desktop, will be set based on mobile in useEffect
  const [isVipPopupOpen, setIsVipPopupOpen] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [hasStrangerVideo, setHasStrangerVideo] = useState(false)
  const [showTooltips, setShowTooltips] = useState(true)
  const [isSearchingForStranger, setIsSearchingForStranger] = useState(false)
  const [chatNotifications, setChatNotifications] = useState<ChatNotificationType[]>([])
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [spotifySearchQuery, setSpotifySearchQuery] = useState("")
  const [spotifySearchResults, setSpotifySearchResults] = useState<any[]>([])
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([])
  const [freeSongsRemaining, setFreeSongsRemaining] = useState(5)
  const [spotifyPanelOpen, setSpotifyPanelOpen] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [musicUsageCount, setMusicUsageCount] = useState(0)
  const [isVip, setIsVip] = useState(false)
  const [showMusicPlayer, setShowMusicPlayer] = useState(false)
  const [showFriendsList, setShowFriendsList] = useState(false)
  const [showCountrySelector, setShowCountrySelector] = useState(false)
  const [showDatingList, setShowDatingList] = useState(false)
  const [notifications, setNotifications] = useState<
    Array<{ id: string; type: "commend" | "kick" | "received-commend" | "super-like"; message: string }>
  >([])
  const [showThumbsUp, setShowThumbsUp] = useState(false)
  const [showThumbsDown, setShowThumbsDown] = useState(false)
  const [showHeartAnimation, setShowHeartAnimation] = useState(false)
  const [freeSuperLikes, setFreeSuperLikes] = useState(2) // Start with 2 free super likes
  const [datingMatches, setDatingMatches] = useState<DatingMatch[]>([])
  const [remoteUsers, setRemoteUsers] = useState<any[]>([])
  const [hasPublishedVideo, setHasPublishedVideo] = useState(false)
  const [isCameraAccessDenied, setIsCameraAccessDenied] = useState(false)
  const [startChatClicked, setStartChatClicked] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isReady, setIsReady] = useState(false)

  // Interest and lobby system states
  const [showInterestSelector, setShowInterestSelector] = useState(false)
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null)
  const [currentLobby, setCurrentLobby] = useState<string>("General")
  const [initialInterestLoaded, setInitialInterestLoaded] = useState(false)

  // All useRef hooks
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const friendsListRef = useRef<HTMLDivElement | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  const [showUserProfile, setShowUserProfile] = useState(false)
  const [strangerReputation, setStrangerReputation] = useState<UserReputation>({
    level: Math.floor(Math.random() * 5) + 1,
    points: Math.floor(Math.random() * 500) + 25,
    positiveRatings: Math.floor(Math.random() * 50) + 5,
    negativeRatings: Math.floor(Math.random() * 5),
    badges: [],
    interestGroupBans: [],
  })
  const [userReputation, setUserReputation] = useState<UserReputation>({
    level: 1,
    points: 25,
    positiveRatings: 5,
    negativeRatings: 0,
    badges: [],
    interestGroupBans: [],
  })

  // Add debug log
  const addDebugLog = useCallback((message: string) => {
    console.log(message) // Also log to console for easier debugging
    setDebugLogs((prev) => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`])
  }, [])

  // Clear debug logs
  const clearDebugLogs = useCallback(() => {
    setDebugLogs([])
  }, [])

  // Add a message to the chat
  const addMessage = useCallback(
    (
      text: string,
      sender: "me" | "stranger",
      username?: string,
      isMusic?: boolean,
      isEmoji?: boolean,
      isMeme?: boolean,
      isImage?: boolean,
      musicData?: any,
      memeUrl?: string,
      imageUrl?: string,
    ) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        sender,
        timestamp: new Date(),
        username,
        isMusic,
        isEmoji,
        isMeme,
        isImage,
        musicData,
        memeUrl,
        imageUrl,
      }

      setMessages((prev) => [...prev, newMessage])

      // If on mobile and the message is from stranger, show notification
      if (isMobile && sender === "stranger" && username !== "System" && !showChat) {
        const notification: ChatNotificationType = {
          id: Date.now().toString(),
          message: text,
          sender: username || "Stranger",
        }
        setChatNotifications((prev) => [...prev, notification])
      }
    },
    [isMobile, showChat],
  )

  // Set stranger info based on real connection
  const setStrangerInfo = useCallback((identity: string, country = "US") => {
    // Use the identity from LiveKit or a default username
    setStrangerUsername(identity || "User")

    // Find country or use default
    const userCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0]
    setStrangerCountry(userCountry)

    // Set default reputation
    setStrangerReputation({
      level: 1,
      points: 25,
      positiveRatings: 0,
      negativeRatings: 0,
      badges: [],
      interestGroupBans: [],
    })
  }, [])

  // Function to join a video chat
  const joinVideoChat = useCallback(
    async (roomId: string) => {
      try {
        // Check if user is logged in
        if (!isLoggedIn) {
          addDebugLog("User not logged in, showing auth modal")
          setShowAuthModal(true)
          setIsConnecting(false)
          setIsSearchingForStranger(false)
          return
        }

        // Verify Supabase session before proceeding
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          addDebugLog("No active session found, showing auth modal")
          setShowAuthModal(true)
          setIsConnecting(false)
          setIsSearchingForStranger(false)
          return
        }

        // Fetch token with the room ID
        const tokenResponse = await fetch(`/api/token?room=${roomId}`)

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          console.error(`Token API error: ${tokenResponse.status}`, errorText)

          // If unauthorized, show auth modal
          if (tokenResponse.status === 401) {
            setShowAuthModal(true)
            addDebugLog("Authentication required, showing login modal")
          } else {
            addMessage(`Error getting token: ${tokenResponse.status}. Please try again.`, "stranger", "System")
          }

          setIsConnecting(false)
          setIsSearchingForStranger(false)
          return
        }

        let tokenData
        try {
          tokenData = await tokenResponse.json()
        } catch (jsonError) {
          console.error("Failed to parse token response as JSON:", jsonError)
          addMessage("Invalid response from server. Please try again.", "stranger", "System")
          setIsConnecting(false)
          setIsSearchingForStranger(false)
          return
        }

        console.log("Token data:", tokenData)

        // Set channel name and user ID
        setChannelName(roomId)

        // Update state
        setIsConnected(true)
        setIsConnecting(false)
        setIsSearchingForStranger(false)

        // Add a welcome message
        if (selectedInterest) {
          addMessage(`Connected! You're chatting with someone in the ${currentLobby} lobby.`, "stranger", "System")
        } else {
          addMessage(`Connected! You're chatting with someone in the General lobby.`, "stranger", "System")
        }

        // Set the stranger info based on the token data
        setStrangerInfo(tokenData.identity, selectedCountry.code)

        // Simulate stranger video after a delay (this will be replaced by actual LiveKit connection)
        setTimeout(() => {
          setHasStrangerVideo(true)
        }, 2000)
      } catch (error) {
        console.error("Error joining video chat:", error)
        setIsConnecting(false)
        setIsSearchingForStranger(false)
        addMessage("Error joining chat. Please try again.", "stranger", "System")
      }
    },
    [
      isLoggedIn,
      selectedInterest,
      currentLobby,
      selectedCountry.code,
      addMessage,
      setStrangerInfo,
      addDebugLog,
      supabase.auth,
    ],
  )

  // Start chat function - DEFINE THIS FIRST
  const startChat = useCallback(async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      addDebugLog("User not logged in, showing auth modal")
      setShowAuthModal(true)
      return
    }

    // Set states to show we're connecting
    setIsConnecting(true)
    setIsSearchingForStranger(true)
    addDebugLog("Starting chat process")

    try {
      // First, check if camera is available
      let hasVideo = false

      try {
        // Try to access the camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })

        // If we get here, camera access was granted
        hasVideo = true

        // Stop the stream since we'll create a new one for the actual connection
        stream.getTracks().forEach((track) => track.stop())

        addDebugLog("Camera access granted")
      } catch (cameraError) {
        console.error("Camera access denied:", cameraError)
        addDebugLog("Camera access denied")

        // Show error message to user
        setErrorMessage("Camera access is required to connect with others.")
        setIsConnecting(false)
        setIsSearchingForStranger(false)
        addMessage(
          "Camera access is required to connect with others. Please enable your camera and try again.",
          "stranger",
          "System",
        )
        return
      }

      // Verify Supabase session before proceeding
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        addDebugLog("No active session found, showing auth modal")
        setShowAuthModal(true)
        setIsConnecting(false)
        setIsSearchingForStranger(false)
        return
      }

      // Call the match API to find a match
      const matchResponse = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hasVideo,
          interests: selectedInterest ? [selectedInterest.name] : ["General"],
        }),
      })

      if (!matchResponse.ok) {
        const errorData = await matchResponse.text()
        console.error(`Match API error: ${matchResponse.status}`, errorData)

        // If unauthorized, show auth modal
        if (matchResponse.status === 401) {
          setShowAuthModal(true)
          addDebugLog("Authentication required for matchmaking, showing login modal")
        } else {
          addMessage(`Error finding a match: ${matchResponse.status}. Please try again.`, "stranger", "System")
        }

        setIsConnecting(false)
        setIsSearchingForStranger(false)
        return
      }

      const matchData = await matchResponse.json()

      if (matchData.status === "matched") {
        // We found a match! Join the room
        joinVideoChat(matchData.roomId)
      } else if (matchData.status === "waiting") {
        // We're waiting for a match
        addMessage("Waiting for someone to join. This may take a moment...", "stranger", "System")

        // Set up polling to check for matches
        const checkForMatches = async () => {
          if (!isSearchingForStranger) return // Stop if user cancelled

          try {
            const checkResponse = await fetch("/api/check-match", {
              method: "GET",
            })

            if (checkResponse.ok) {
              const checkData = await checkResponse.json()

              if (checkData.status === "matched") {
                // We found a match! Join the room
                joinVideoChat(checkData.roomId)
                return // Stop polling
              }
            }

            // Continue polling
            if (isSearchingForStranger) {
              searchTimeoutRef.current = setTimeout(checkForMatches, 3000)
            }
          } catch (error) {
            console.error("Error checking for matches:", error)
            if (isSearchingForStranger) {
              searchTimeoutRef.current = setTimeout(checkForMatches, 5000) // Retry with longer delay
            }
          }
        }

        // Start polling
        searchTimeoutRef.current = setTimeout(checkForMatches, 3000)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
      addDebugLog(`Error starting chat: ${error.message}`)
      setIsConnecting(false)
      setIsSearchingForStranger(false)
      addMessage("Error connecting to chat. Please try again.", "stranger", "System")
    }
  }, [isLoggedIn, selectedInterest, addDebugLog, addMessage, joinVideoChat, supabase.auth, isSearchingForStranger])

  // Update the handleStartChat function to check for video before starting - DEFINE THIS SECOND
  const handleStartChat = useCallback(
    (e?: React.MouseEvent) => {
      // Prevent any default behavior that might cause page reload
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }

      // Prevent multiple clicks
      if (startChatClicked) {
        return
      }

      try {
        setStartChatClicked(true)
        addDebugLog("Start chat button clicked")

        // Check if user is logged in
        if (!isLoggedIn) {
          addDebugLog("User not logged in, showing auth modal")
          setShowAuthModal(true)
          setStartChatClicked(false)
          return
        }

        // Check if video is published
        if (!hasPublishedVideo) {
          addMessage(
            "Camera access is required to connect with others. Please enable your camera and try again.",
            "stranger",
            "System",
          )
          setErrorMessage("Camera access is required to connect with others.")
          setStartChatClicked(false)
          return
        }

        // Hide the waiting screen to show the videos
        setShowWaitingScreen(false)

        // Start the chat process
        startChat().finally(() => {
          // Reset the button state when done
          setStartChatClicked(false)
        })
      } catch (error) {
        console.error("Error in handleStartChat:", error)
        addDebugLog(`Error in handleStartChat: ${error}`)
        setStartChatClicked(false)
      }
    },
    [isLoggedIn, startChatClicked, hasPublishedVideo, addDebugLog, addMessage, startChat],
  )

  // Handle interest selection - DEFINE THIS THIRD
  const handleInterestSelect = useCallback(
    (interest: Interest) => {
      setSelectedInterest(interest)
      setShowInterestSelector(false)
      setCurrentLobby(interest.name)
      addDebugLog(`Selected interest: ${interest.name}`)

      // Save to localStorage immediately
      localStorage.setItem("selectedInterest", JSON.stringify(interest))

      // Start chat immediately after selecting interest
      setShowWaitingScreen(false)
      // We'll call handleStartChat after a short delay to ensure state updates have completed
      setTimeout(() => {
        handleStartChat()
      }, 100)
    },
    [addDebugLog, handleStartChat],
  )

  // Define onEditProfile callback
  const onEditProfile = useCallback(() => {
    // Close the sidebar if it's open
    setIsSidebarOpen(false)

    // If user is logged in, show the profile modal
    if (isLoggedIn && user) {
      setIsProfileModalOpen(true)
    } else {
      // Only show auth modal if not logged in
      setShowAuthModal(true)
    }
  }, [isLoggedIn, user])

  // Skip to next person
  const skipToNext = useCallback(async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      addDebugLog("User not logged in, showing auth modal")
      setShowAuthModal(true)
      return
    }

    // Reset state
    setMessages([])
    setInviteFriendId(null)
    setErrorMessage(null)
    setHasStrangerVideo(false)
    setIsConnected(false)
    setIsConnecting(true)
    setIsSearchingForStranger(true)
    setRemoteUsers([])
    setShowUserProfile(false)

    // Show finding next message
    addMessage(`Finding next person in ${currentLobby} lobby...`, "stranger", "System")

    // Start a new chat
    await startChat()
  }, [isLoggedIn, currentLobby, addMessage, startChat, addDebugLog])

  // Stop the chat - MODIFIED to just stop searching but keep showing yourself
  const stopChat = useCallback(async () => {
    // Clear any existing search timeout
    if (searchTimeoutRef.current) {
      clearInterval(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }

    // Update state
    setIsConnected(false)
    setIsSearchingForStranger(false)
    setHasStrangerVideo(false)
    setRemoteUsers([])
    addDebugLog("Chat stopped, but camera still active")

    // Show a message that we've stopped searching
    addMessage("Stopped searching. Click Start to begin looking for someone new.", "stranger", "System")
  }, [addDebugLog, addMessage])

  // Add a setupLocalCamera function to the main component
  const setupLocalCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setHasPublishedVideo(true)
      setIsCameraAccessDenied(false)

      // Stop the stream since CameraView will create its own
      stream.getTracks().forEach((track) => track.stop())
    } catch (err) {
      console.error("Error accessing camera:", err)
      setHasPublishedVideo(false)
      setIsCameraAccessDenied(true)
      addMessage(
        "Camera access is required to connect with others. Please enable your camera and try again.",
        "stranger",
        "System",
      )
    }
  }, [addMessage])

  // Update the renderLocalVideo function to handle camera access denied
  const renderLocalVideo = useCallback(() => {
    if (isCameraAccessDenied) {
      return (
        <CameraAccessDenied
          onRetry={() => {
            setIsCameraAccessDenied(false)
            setupLocalCamera()
          }}
        />
      )
    }

    return (
      <CameraView
        isLocal={true}
        username={user?.username || "You"}
        countryFlag={selectedCountry.flag}
        isActive={true}
        profileImage={user?.profileImage}
        onVideoPublished={(published) => {
          setHasPublishedVideo(published)
          if (!published) {
            setIsCameraAccessDenied(true)
          }
          addDebugLog(`Local video published: ${published}`)
        }}
      />
    )
  }, [isCameraAccessDenied, user, selectedCountry.flag, setupLocalCamera, addDebugLog])

  // Add notification
  const addNotification = useCallback(
    (type: "commend" | "kick" | "received-commend" | "super-like", message: string) => {
      const newNotification = {
        id: Date.now().toString(),
        type,
        message,
      }
      setNotifications((prev) => [...prev, newNotification])

      // Simulate receiving commendations occasionally
      if (type === "commend" && Math.random() > 0.7) {
        setTimeout(() => {
          addNotification("received-commend", "Someone commended you as 'Friendly'!")
        }, 5000)
      }
    },
    [],
  )

  // Handle direct thumbs up from video overlay
  const handleDirectThumbsUp = useCallback(async () => {
    // Show thumbs up animation
    setShowThumbsUp(true)
    setTimeout(() => setShowThumbsUp(false), 2000)

    if (!isLoggedIn) {
      addMessage("Please sign in to rate users", "stranger", "System")
      setShowAuthModal(true)
      return
    }

    // Update stranger reputation
    setStrangerReputation((prev) => ({
      ...prev,
      points: prev.points + 10,
      positiveRatings: prev.positiveRatings + 1,
    }))

    // Show a notification
    addNotification("commend", `You gave ${strangerUsername} a thumbs up!`)

    // Show a message in the chat
    addMessage(`You gave ${strangerUsername} a thumbs up!`, "stranger", "System")
  }, [isLoggedIn, strangerUsername, addMessage, addNotification])

  // Handle direct thumbs down from video overlay
  const handleDirectThumbsDown = useCallback(async () => {
    setShowThumbsDown(true)
    setTimeout(() => setShowThumbsDown(false), 2000)

    if (!isLoggedIn) {
      addMessage("Please sign in to rate users", "stranger", "System")
      setShowAuthModal(true)
      return
    }

    // Update stranger reputation
    setStrangerReputation((prev) => ({
      ...prev,
      negativeRatings: prev.negativeRatings + 1,
    }))

    // Show a notification
    const reason = "Inappropriate behavior"
    addNotification("kick", `You reported ${strangerUsername} for "${reason}".`)

    // Show a message in the chat
    addMessage(
      `You reported ${strangerUsername} for "${reason}". Our moderators will review this.`,
      "stranger",
      "System",
    )

    // Skip to next person after a short delay
    setTimeout(() => {
      skipToNext()
    }, 1500)
  }, [isLoggedIn, strangerUsername, addMessage, addNotification, skipToNext])

  // Handle super like
  const handleSuperLike = useCallback(
    (username: string) => {
      // Check if user is logged in
      if (!isLoggedIn) {
        addMessage("Please sign in to use Super Like", "stranger", "System")
        setShowAuthModal(true)
        return
      }

      // Show heart animation
      setShowHeartAnimation(true)
      setTimeout(() => setShowHeartAnimation(false), 2000)

      // Add notification
      addNotification("super-like", `You sent a Super Like to ${username}!`)

      // Add message to chat
      addMessage(`You sent a Super Like to ${username}!`, "stranger", "System")

      // Add to dating matches (50% chance of match)
      if (Math.random() > 0.5) {
        setTimeout(() => {
          addNotification("super-like", `${username} liked you back! It's a match!`)
          addMessage(`${username} liked you back! It's a match!`, "stranger", "System")

          // Add to dating matches
          const newMatch: DatingMatch = {
            id: `dm-${Date.now()}`,
            name: username,
            country: strangerCountry.code,
            countryFlag: strangerCountry.flag,
            matchDate: new Date().toISOString(),
            online: true,
          }

          setDatingMatches((prev) => [newMatch, ...prev])
        }, 3000)
      }
    },
    [isLoggedIn, strangerCountry.code, strangerCountry.flag, addMessage, addNotification],
  )

  // Handle using a free super like
  const handleUseFreeSuper = useCallback(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      addMessage("Please sign in to use Super Like", "stranger", "System")
      setShowAuthModal(true)
      return
    }

    if (freeSuperLikes > 0) {
      setFreeSuperLikes((prev) => prev - 1)
    }
  }, [isLoggedIn, freeSuperLikes, addMessage])

  // Handle commendation
  const handleCommendation = useCallback(
    (commendation: Omit<UserCommendation, "id" | "timestamp">) => {
      // Check if user is logged in
      if (!isLoggedIn) {
        addMessage("Please sign in to commend users", "stranger", "System")
        setShowAuthModal(true)
        return
      }

      console.log("User commended:", commendation)

      // Show thumbs up animation
      setShowThumbsUp(true)
      setTimeout(() => setShowThumbsUp(false), 2000)

      // In a real app, this would send the commendation to a backend
      // For now, we'll just update the local state
      setStrangerReputation((prev) => ({
        ...prev,
        points: prev.points + 10,
        positiveRatings: prev.positiveRatings + 1,
      }))

      // Show a notification
      addNotification("commend", `You commended ${strangerUsername} as "${commendation.type}"!`)

      // Show a message in the chat
      addMessage(
        `You commended ${strangerUsername} as "${commendation.type}"${commendation.message ? `: "${commendation.message}"` : ""}.`,
        "stranger",
        "System",
      )
    },
    [isLoggedIn, strangerUsername, addNotification, addMessage],
  )

  // Handle kick vote
  const handleKickVote = useCallback(
    (reason: string) => {
      // Check if user is logged in
      if (!isLoggedIn) {
        addMessage("Please sign in to report users", "stranger", "System")
        setShowAuthModal(true)
        return
      }

      console.log("Kick vote:", reason)

      // Show thumbs down animation
      setShowThumbsDown(true)
      setTimeout(() => setShowThumbsDown(false), 2000)

      // In a real app, this would send the kick vote to a backend
      // For now, we'll just update the local state
      setStrangerReputation((prev) => ({
        ...prev,
        negativeRatings: prev.negativeRatings + 1,
      }))

      // Show a notification
      addNotification("kick", `You reported ${strangerUsername} for "${reason}".`)

      // Show a message in the chat
      addMessage(
        `You reported ${strangerUsername} for "${reason}". Our moderators will review this report.`,
        "stranger",
        "System",
      )

      // Skip to next person
      skipToNext()
    },
    [isLoggedIn, strangerUsername, addNotification, addMessage, skipToNext],
  )

  // Function to render the remote video
  const renderRemoteVideo = useCallback(() => {
    // Find the first remote user with a video track
    const remoteUser = remoteUsers.find((user) => user.videoTrack)
    const isDatingMode = currentLobby === "Speed Dating"

    return (
      <div className="relative h-full">
        <CameraView
          isLocal={false}
          username={strangerUsername}
          countryFlag={strangerCountry.flag}
          isActive={hasStrangerVideo && isConnected}
          // videoTrack={remoteUser?.videoTrack}
          // audioTrack={remoteUser?.audioTrack}
          onProfileClick={() => setShowUserProfile(true)}
        />

        {/* Dating Mode Overlay */}
        {isDatingMode && <DatingModeOverlay isVIP={isVip} />}

        {isConnected && hasStrangerVideo && (
          <VideoOverlayActions
            onThumbsUp={handleDirectThumbsUp}
            onThumbsDown={handleDirectThumbsDown}
            onViewProfile={() => setShowUserProfile(true)}
            onSuperLike={isDatingMode ? handleSuperLike : undefined}
            onUpgrade={() => setIsVipPopupOpen(true)}
            onUseFreeSuper={handleUseFreeSuper}
            username={strangerUsername}
            isVIP={isVip}
            freeSuperLikes={freeSuperLikes}
            isDatingMode={isDatingMode}
            targetUserId={strangerUsername} // In a real app, this would be the actual user ID
          />
        )}

        {/* Thumbs animations */}
        {showThumbsUp && <ThumbsAnimation type="up" />}
        {showThumbsDown && <ThumbsAnimation type="down" />}

        {/* Heart animation for super likes */}
        {showHeartAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-ping text-pink-500 opacity-75" style={{ fontSize: "150px" }}>
              ❤️
            </div>
          </div>
        )}
      </div>
    )
  }, [
    remoteUsers,
    currentLobby,
    strangerUsername,
    strangerCountry.flag,
    hasStrangerVideo,
    isConnected,
    isVip,
    handleDirectThumbsUp,
    handleDirectThumbsDown,
    handleSuperLike,
    handleUseFreeSuper,
    freeSuperLikes,
    showThumbsUp,
    showThumbsDown,
    showHeartAnimation,
  ])

  // Handle country selection - VIP feature
  const handleCountrySelect = useCallback(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      addMessage("Please sign in to select country", "stranger", "System")
      setShowAuthModal(true)
      return
    }

    setShowCountrySelector(true)
  }, [isLoggedIn, addMessage])

  // Change country
  const changeCountry = useCallback(
    (country: (typeof COUNTRIES)[0]) => {
      setSelectedCountry(country)
      addDebugLog(`Country changed to: ${country.name}`)
      // In a real app, this would filter users by country
      skipToNext()
    },
    [addDebugLog, skipToNext],
  )

  // Show interest selector
  const openInterestSelector = useCallback(() => {
    setShowInterestSelector(true)
    // Don't reset the selectedInterest here
  }, [])

  // Handle stop chat
  const handleStopChat = useCallback(() => {
    stopChat()
  }, [stopChat])

  // Toggle friends list
  const toggleFriendsList = useCallback(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      addMessage("Please sign in to view friends", "stranger", "System")
      setShowAuthModal(true)
      return
    }

    setShowFriendsList(!showFriendsList)
  }, [isLoggedIn, showFriendsList, addMessage])

  // Play track
  const playTrack = useCallback(
    (track: any) => {
      if (audioRef.current) {
        audioRef.current.src = track.url
        audioRef.current.play()
        setIsAudioPlaying(true)
        setCurrentTrack(track)
        addMessage(`Now playing: ${track.title} by ${track.artist}`, "stranger", "System", true, false, false, false, {
          title: track.title,
          artist: track.artist,
          albumArt: track.albumArt,
        })
      }
    },
    [addMessage],
  )

  // Play next track
  const playNextTrack = useCallback(() => {
    if (currentTrack) {
      const currentIndex = SAMPLE_TRACKS.findIndex((track) => track.id === currentTrack.id)
      const nextIndex = (currentIndex + 1) % SAMPLE_TRACKS.length
      playTrack(SAMPLE_TRACKS[nextIndex])
    }
  }, [currentTrack, playTrack])

  // Handle logout
  const handleLogoutSuccess = useCallback(async () => {
    try {
      // Call the signOut function from useAuth
      await signOut()

      // Clear local storage
      localStorage.removeItem("user")

      // Update state
      setUser(null)
      setIsLoggedIn(false)
      setIsSidebarOpen(false)

      addDebugLog("User logged out successfully")

      // Show a message
      addMessage("You have been logged out successfully.", "stranger", "System")
    } catch (error) {
      console.error("Error during logout:", error)
      addDebugLog(`Error during logout: ${error.message}`)
    }
  }, [addDebugLog, signOut, addMessage])

  // Handle subscribe
  const handleSubscribe = useCallback(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      addMessage("Please sign in to subscribe", "stranger", "System")
      setShowAuthModal(true)
      setIsVipPopupOpen(false)
      return
    }

    const updatedUser = {
      ...user,
      isVIP: true,
      subscriptionDate: new Date().toISOString(),
    }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    setIsVipPopupOpen(false)
    setIsVip(true)
  }, [user, isLoggedIn, addMessage])

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const sendFriendRequest = useCallback(
    (username: string) => {
      // Check if user is logged in
      if (!isLoggedIn) {
        addMessage("Please sign in to send friend requests", "stranger", "System")
        setShowAuthModal(true)
        return
      }

      // In a real app, this would send a friend request to the user
      console.log(`Friend request sent to ${username}`)
      addMessage(`Friend request sent to ${username}`, "stranger", "System")
    },
    [addMessage, isLoggedIn],
  )

  const sendMessage = useCallback(() => {
    if (messageInput.trim()) {
      addMessage(messageInput, "me", user?.username)
      setMessageInput("")
    }
  }, [messageInput, addMessage, user])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && messageInput.trim()) {
        sendMessage()
      }
    },
    [messageInput, sendMessage],
  )

  const handleEmojiMemeSelect = useCallback(
    (value: string) => {
      addMessage(value, "me", user?.username, false, true)
    },
    [addMessage, user],
  )

  // Handle login button click
  const handleLoginClick = useCallback(() => {
    setShowAuthModal(true)
    setIsLoginModalOpen(false)
  }, [])

  // Set showChat based on mobile status
  useEffect(() => {
    if (isMobile) {
      setShowChat(false)
    }
  }, [isMobile])

  // Load saved interest on initial mount only
  useEffect(() => {
    const savedInterest = localStorage.getItem("selectedInterest")
    if (savedInterest) {
      try {
        const parsedInterest = JSON.parse(savedInterest)
        setSelectedInterest(parsedInterest)
        setCurrentLobby(parsedInterest.name)
        // Don't show the selector if we already have an interest
        setShowInterestSelector(false)
      } catch (e) {
        console.error("Error parsing saved interest:", e)
        localStorage.removeItem("selectedInterest")
        setShowInterestSelector(true)
      }
    } else {
      // Only show the selector if we don't have a saved interest
      setShowInterestSelector(true)
    }
    setInitialInterestLoaded(true)
  }, []) // Empty dependency array means this runs once on mount

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          addDebugLog("User is authenticated")
          setIsLoggedIn(true)
          setShowAuthModal(false)

          // Fetch user profile from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (profileData && !profileError) {
            // Update user state with profile data
            const userData: UserType = {
              username: profileData.username || session.user.email?.split("@")[0] || "User",
              email: session.user.email,
              isLoggedIn: true,
              instagram: profileData.instagram,
              snapchat: profileData.snapchat,
              facebook: profileData.facebook,
              discord: profileData.discord,
              profileImage: profileData.avatar_url || undefined,
              country: profileData.country,
              isVIP: profileData.is_vip || false,
              subscriptionDate: profileData.subscription_date,
              reputation: userReputation,
            }

            setUser(userData)
            if (userData.isVIP) {
              setIsVip(true)
            }
          } else {
            // If there's an error fetching profile, show auth modal
            console.error("Error fetching profile:", profileError)
            setShowAuthModal(true)
          }
        } else {
          addDebugLog("No active session found")
          setIsLoggedIn(false)
          // Don't automatically show auth modal on page load
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        addDebugLog(`Auth check error: ${error.message}`)
        // Show auth modal on error
        setShowAuthModal(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      addDebugLog(`Auth state changed: ${event}`)

      if (event === "SIGNED_IN") {
        setIsLoggedIn(true)
        setShowAuthModal(false)

        // Redirect to homepage after login if needed
        if (window.location.pathname !== "/") {
          window.location.href = "/"
        }

        // Fetch user profile after sign in
        if (session) {
          supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
            .then(({ data: profileData, error: profileError }) => {
              if (profileData && !profileError) {
                // Update user state with profile data
                const userData: UserType = {
                  username: profileData.username || session.user.email?.split("@")[0] || "User",
                  email: session.user.email,
                  isLoggedIn: true,
                  instagram: profileData.instagram,
                  snapchat: profileData.snapchat,
                  facebook: profileData.facebook,
                  discord: profileData.discord,
                  profileImage: profileData.avatar_url || undefined,
                  country: profileData.country,
                  isVIP: profileData.is_vip || false,
                  subscriptionDate: profileData.subscription_date,
                  reputation: userReputation,
                }

                setUser(userData)
                if (userData.isVIP) {
                  setIsVip(true)
                }
              }
            })
        }
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false)
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, addDebugLog, userReputation])

  // Sync auth user with local state
  useEffect(() => {
    if (authUser && authProfile) {
      const userData: UserType = {
        username: authProfile.username || authUser.email?.split("@")[0] || "User",
        email: authUser.email,
        isLoggedIn: true,
        instagram: authProfile.instagram,
        snapchat: authProfile.snapchat,
        facebook: authProfile.facebook,
        discord: authProfile.discord,
        profileImage: authProfile.avatar_url || undefined,
        country: authProfile.country,
        isVIP: authProfile.is_vip || false,
        subscriptionDate: authProfile.subscription_date,
        reputation: userReputation,
      }

      setUser(userData)
      setIsLoggedIn(true)
      setShowAuthModal(false) // Hide auth modal when user is logged in

      if (userData.isVIP) {
        setIsVip(true)
      }

      addDebugLog(`Auth user synced: ${userData.username}`)
    }
  }, [authUser, authProfile, userReputation, addDebugLog])

  // Add this useEffect to handle the start chat button
  useEffect(() => {
    if (startChatClicked && !isLoggedIn) {
      setShowAuthModal(true)
      setStartChatClicked(false)
    }
  }, [startChatClicked, isLoggedIn])

  // Check if user is logged in
  useEffect(() => {
    // Only run this if we don't have auth user data
    if (!authUser) {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        // Initialize reputation if not present
        if (!parsedUser.reputation) {
          parsedUser.reputation = userReputation
        }
        setUser(parsedUser)
        setIsLoggedIn(true)
        setUserReputation(parsedUser.reputation || userReputation)
        if (parsedUser.isVIP) {
          setIsVip(true)
        }
      }
    }

    // Load friends
    const storedFriends = localStorage.getItem("friends")
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends))
    } else {
      // Default friends for demo
      const defaultFriends = [
        { id: "1", name: "Alex123", online: true },
        { id: "2", name: "Jordan456", online: false },
        { id: "3", name: "Taylor789", online: true },
        { id: "4", name: "Riley42", online: true },
      ]
      setFriends(defaultFriends)
      localStorage.setItem("friends", JSON.stringify(defaultFriends))
    }

    // Load dating matches
    const storedMatches = localStorage.getItem("datingMatches")
    if (storedMatches) {
      setDatingMatches(JSON.parse(storedMatches))
    } else {
      // Default dating matches for demo
      const defaultMatches: DatingMatch[] = [
        {
          id: "dm1",
          name: "Jamie",
          country: "US",
          countryFlag: "🇺🇸",
          matchDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          lastMessage: "Hey, how are you?",
          online: true,
        },
        {
          id: "dm2",
          name: "Taylor",
          country: "CA",
          countryFlag: "🇨🇦",
          matchDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          lastMessage: "Would love to chat again sometime!",
          online: false,
        },
      ]
      setDatingMatches(defaultMatches)
      localStorage.setItem("datingMatches", JSON.stringify(defaultMatches))
    }

    // Load free super likes
    const storedSuperLikes = localStorage.getItem("freeSuperLikes")
    if (storedSuperLikes) {
      setFreeSuperLikes(Number.parseInt(storedSuperLikes, 10))
    } else {
      // Default to 2 free super likes
      localStorage.setItem("freeSuperLikes", "2")
    }

    // Create audio element for music
    audioRef.current = new Audio()
    audioRef.current.addEventListener("ended", () => {
      // Play next track when current one ends
      playNextTrack()
    })

    // Simulate online users count increasing
    const interval = setInterval(() => {
      setOnlineUsers((prev) => {
        const change = Math.floor(Math.random() * 10) - 3
        const newValue = prev + change
        // Keep between 500 and 4500
        return Math.max(500, Math.min(4500, newValue))
      })
    }, 5000)

    // Hide tooltips after 10 seconds
    const tooltipTimer = setTimeout(() => {
      setShowTooltips(false)
    }, 10000)

    // Generate a random user ID for this session
    const newUserId = Math.floor(Math.random() * 100000)
    setUserId(newUserId)

    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Check VIP status
    const savedVipState = localStorage.getItem("isVip")
    if (savedVipState === "true") {
      setIsVip(true)
    }

    // Reset music usage count at midnight
    const now = new Date()
    const lastReset = localStorage.getItem("lastMusicReset")
    if (!lastReset || new Date(lastReset).getDate() !== now.getDate()) {
      localStorage.setItem("musicUsageCount", "0")
      localStorage.setItem("lastMusicReset", now.toString())
      setMusicUsageCount(0)

      // Reset free super likes daily
      if (!isVip) {
        setFreeSuperLikes(2)
        localStorage.setItem("freeSuperLikes", "2")
      }
    } else {
      const savedCount = localStorage.getItem("musicUsageCount")
      if (savedCount) {
        setMusicUsageCount(Number.parseInt(savedCount, 10))
      }
    }

    // Check if we need to reset the free songs counter
    const resetDate = localStorage.getItem("freeSongsResetDate")
    if (resetDate) {
      const lastReset = new Date(resetDate)
      const now = new Date()

      // Reset if it's a new day
      if (
        lastReset.getDate() !== now.getDate() ||
        lastReset.getMonth() !== now.getMonth() ||
        lastReset.getFullYear() !== now.getFullYear()
      ) {
        setFreeSongsRemaining(5)
        localStorage.setItem("freeSongsRemaining", "5")
        localStorage.setItem("freeSongsResetDate", new Date().toISOString())
      } else {
        // Load saved count
        const savedCount = localStorage.getItem("freeSongsRemaining")
        if (savedCount) {
          setFreeSongsRemaining(Number.parseInt(savedCount))
        }
      }
    } else {
      // First time user
      setFreeSongsRemaining(5)
      localStorage.setItem("freeSongsRemaining", "5")
      localStorage.setItem("freeSongsResetDate", new Date().toISOString())
    }

    // Call setupLocalCamera when the component mounts
    setupLocalCamera()

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      clearInterval(interval)
      clearTimeout(tooltipTimer)
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [authUser, userReputation, isVip, addDebugLog, playNextTrack, setupLocalCamera])

  // Save login state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString())
    localStorage.setItem("isVip", isVip.toString())
  }, [isLoggedIn, isVip])

  // Save selected interest to localStorage when it changes
  useEffect(() => {
    if (selectedInterest) {
      localStorage.setItem("selectedInterest", JSON.stringify(selectedInterest))
      setCurrentLobby(selectedInterest.name)
      // Don't automatically start chat or reload
    }
  }, [selectedInterest])

  // Save free super likes count to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("freeSuperLikes", freeSuperLikes.toString())
  }, [freeSuperLikes])

  // Save dating matches to localStorage when they change
  useEffect(() => {
    localStorage.setItem("datingMatches", JSON.stringify(datingMatches))
  }, [datingMatches])

  // Connect isLoginModalOpen to showAuthModal
  useEffect(() => {
    if (isLoginModalOpen) {
      setShowAuthModal(true)
      setIsLoginModalOpen(false)
    }
  }, [isLoginModalOpen])

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="mb-8 flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="ChatChill Logo"
            width={500}
            height={250}
            className={isMobile ? "w-64" : "w-96"}
          />
        </div>
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      </div>
    )
  }

  return (
    <DatingThemeProvider isDatingMode={currentLobby === "Speed Dating"}>
      <div className="flex h-screen bg-black text-white overflow-hidden">
        <style jsx global>{`
          @keyframes slide-in-left {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          .animate-slide-in-left {
            animation: slide-in-left 0.3s ease-out forwards;
          }

          .no-outline-button {
            border: none;
            outline: none;
            box-shadow: none;
          }
        `}</style>

        {/* Fixed logo in top left corner - only visible on desktop */}
        {!isMobile && (
          <div className="fixed top-4 left-4 z-50">
            <Image
              src="/images/logo.png"
              alt="ChatChill Logo"
              width={240}
              height={96}
              className="h-32 w-auto"
              priority
            />
          </div>
        )}

        {/* Fixed header with menu buttons - MOBILE ONLY */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-2 bg-black/50 backdrop-blur-sm">
            <div className="flex items-center">
              <Image src="/images/logo.png" alt="ChatChill Logo" width={200} height={80} className="h-24 w-auto" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border-0"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="h-5 w-5 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 rounded-full border-0 ${user?.isVIP ? "bg-yellow-500 text-black" : "bg-black/30 hover:bg-black/50"}`}
                onClick={() => setIsVipPopupOpen(true)}
              >
                <Crown className={`h-5 w-5 ${user?.isVIP ? "text-black" : "text-yellow-500"}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border-0 bg-black/30 hover:bg-black/50"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        )}

        {/* Main content area - videos and chat */}
        <div className="flex flex-1">
          {/* Videos container - left side */}
          <div className={`flex flex-col ${isMobile ? "w-full pt-14" : showChat ? "w-[calc(100%-320px)]" : "w-full"}`}>
            {/* Videos row - column on mobile */}
            <div className="flex flex-col md:flex-row flex-1">
              {/* Stranger video - top on mobile, left on desktop */}
              <div className="relative w-full md:w-1/2 h-1/2 md:h-full bg-black">
                {showWaitingScreen ? (
                  <div className="flex h-full flex-col items-center justify-center p-4">
                    <div className="flex items-center gap-3 text-green-500 mb-8">
                      <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-xl font-medium">{onlineUsers.toLocaleString()} users online</p>
                    </div>
                    {!isLoggedIn ? (
                      <div className="flex flex-col items-center gap-4 mb-8">
                        <Button
                          className="bg-yellow-500 text-black hover:bg-yellow-600 px-8 max-w-[200px]"
                          onClick={handleLoginClick}
                        >
                          Sign In / Create Account
                        </Button>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <a href="#" className="inline-block h-12" aria-label="Download on the App Store">
                            <div className="flex items-center justify-center h-full px-4 py-2 bg-black text-white rounded-lg border border-gray-700">
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="mr-2">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.33-.89 3.55-.77 1.5.16 2.63.77 3.38 1.95-3.03 1.72-2.39 5.8.84 6.75-.61 1.62-1.42 3.26-2.85 4.24zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.01-1.76 4.04-3.74 4.25z" />
                              </svg>
                              <span>App Store</span>
                            </div>
                          </a>
                          <a href="#" className="inline-block h-12" aria-label="Get it on Google Play">
                            <div className="flex items-center justify-center h-full px-4 py-2 bg-black text-white rounded-lg border border-gray-700">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                                <path d="M3.609 1.814L13.792 12 3.609 22.186c-.181.181-.29.435-.29.71 0 .544.46 1.004 1.004 1.004.275 0 .529-.109.71-.29l10.8-10.8c.181-.181.29-.435.29-.71s-.109-.529-.29-.71l-10.8-10.8c-.181-.181-.435-.29-.71-.29-.544 0-1.004.46-1.004 1.004 0 .275.109.529.29.71z" />
                              </svg>
                              <span>Google Play</span>
                            </div>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 mb-8">
                        {!user?.isVIP && (
                          <Button
                            onClick={() => setIsVipPopupOpen(true)}
                            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-medium"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Upgrade to VIP
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Interest selection button */}
                    <Button
                      onClick={openInterestSelector}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      <Compass className="mr-2 h-5 w-5" />
                      Find People by Interest
                    </Button>
                  </div>
                ) : (
                  <div className="relative h-full">
                    {/* Searching overlay */}
                    {isSearchingForStranger && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                        <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
                        <p className="text-xl font-medium text-white mb-2">
                          Finding next person in {currentLobby} lobby...
                        </p>
                        <p className="text-gray-400 mb-4">This may take a moment</p>
                        <Button variant="outline" onClick={stopChat}>
                          Cancel
                        </Button>
                      </div>
                    )}
                    {renderRemoteVideo()}
                  </div>
                )}

                {isConnected && (
                  <div className="absolute bottom-4 left-4 text-sm text-gray-400">Click to end the current chat</div>
                )}
              </div>

              {/* User video - bottom on mobile, right on desktop */}
              <div className="relative w-full md:w-1/2 h-1/2 md:h-full bg-black">
                {renderLocalVideo()}

                {/* Top menu buttons - DESKTOP ONLY */}
                {!isMobile && (
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <button
                      className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center"
                      style={{ border: "none", outline: "none", boxShadow: "none" }}
                      onClick={() => setShowChat(!showChat)}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    <button
                      className={`h-10 w-10 rounded-full ${user?.isVIP ? "bg-yellow-500 text-black" : "bg-black/50 backdrop-blur-sm text-white"} flex items-center justify-center`}
                      style={{ border: "none", outline: "none", boxShadow: "none" }}
                      onClick={() => setIsVipPopupOpen(true)}
                    >
                      <Crown className={`h-5 w-5 ${user?.isVIP ? "text-black" : "text-yellow-500"}`} />
                    </button>
                    <button
                      className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center"
                      style={{ border: "none", outline: "none", boxShadow: "none" }}
                      onClick={() => setIsSidebarOpen(true)}
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Current lobby indicator - clickable */}
                <button
                  onClick={openInterestSelector}
                  className="absolute top-4 left-4 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {currentLobby === "General" && <Compass className="h-4 w-4 text-blue-400" />}
                    {currentLobby === "Gaming" && <Gamepad2 className="h-4 w-4 text-green-400" />}
                    {currentLobby === "Music" && <Music className="h-4 w-4 text-purple-400" />}
                    {currentLobby === "Movies" && <Film className="h-4 w-4 text-red-400" />}
                    {currentLobby === "Sports" && <Trophy className="h-4 w-4 text-yellow-400" />}
                    {currentLobby === "Tech" && <Cpu className="h-4 w-4 text-cyan-400" />}
                    {currentLobby === "Art" && <Palette className="h-4 w-4 text-orange-400" />}
                    {currentLobby === "Speed Dating" && <Heart className="h-4 w-4 text-pink-500" />}
                    <span className="text-sm font-medium">{currentLobby} Lobby</span>
                  </div>
                </button>

                {/* User level indicator */}
                {user?.reputation && (
                  <div className="absolute bottom-4 right-4 z-20">
                    <ReputationDisplay
                      reputation={user.reputation}
                      size="sm"
                      className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom controls - always visible */}
            <div className="bg-gray-900 border-t border-gray-800 sticky bottom-0 left-0 right-0 z-10">
              <div className="grid grid-cols-2 gap-2 p-2">
                <Button
                  variant="default"
                  className={`h-12 ${currentLobby === "Speed Dating" ? "bg-pink-500 hover:bg-pink-600" : "bg-green-500 hover:bg-green-600"} flex items-center justify-center`}
                  onClick={(e) => (showWaitingScreen ? handleStartChat(e) : skipToNext())}
                  disabled={isConnecting || startChatClicked}
                >
                  {isConnecting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <SkipForward className="mr-2 h-5 w-5" />
                  )}
                  {showWaitingScreen ? "Start" : "Next"}
                </Button>
                <Button
                  variant="default"
                  className="h-12 bg-red-500 hover:bg-red-600 flex items-center justify-center"
                  onClick={handleStopChat}
                >
                  Stop
                </Button>

                <Button
                  variant="outline"
                  className={`h-12 bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white ${isMobile ? "border-0" : ""}`}
                  onClick={handleCountrySelect}
                >
                  <span className="text-xl mr-2">{selectedCountry.flag}</span>
                  <span>Country</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`h-12 w-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white ${isMobile ? "border-0" : ""}`}
                    >
                      {selectedGender === "male" ? (
                        <Male className="mr-2 h-5 w-5 text-blue-400" />
                      ) : selectedGender === "female" ? (
                        <Female className="mr-2 h-5 w-5 text-pink-400" />
                      ) : (
                        <Users2 className="mr-2 h-5 w-5 text-purple-400" />
                      )}
                      <span>I am</span>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                    <DropdownMenuItem
                      onClick={() => setSelectedGender("male")}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-700"
                    >
                      <Male className="h-5 w-5 text-blue-400" />
                      <span>Male</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedGender("female")}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-700"
                    >
                      <Female className="h-5 w-5 text-pink-400" />
                      <span>Female</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedGender("any")}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-700"
                    >
                      <Users2 className="h-5 w-5 text-purple-400" />
                      <span>Any</span>
                    </DropdownMenuItem>

                    <Users2 className="h-5 w-5 text-purple-400" />
                    <span>Any</span>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant={showFriendsList ? "default" : "outline"}
                  className={`h-12 ${showFriendsList ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-800 hover:bg-gray-700"} flex items-center justify-center text-white ${isMobile ? "border-0" : ""}`}
                  onClick={toggleFriendsList}
                >
                  <Users className="mr-2 h-5 w-5" />
                  <span>Friends</span>
                  <span className="ml-2">
                    {showFriendsList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </Button>

                <Button
                  variant={showMusicPlayer ? "default" : "outline"}
                  className={`h-12 w-full ${showMusicPlayer ? "bg-green-600 hover:bg-green-700" : "bg-gray-800 hover:bg-gray-700"} flex items-center justify-center text-white ${isMobile ? "border-0" : ""}`}
                  onClick={() => setShowMusicPlayer(true)}
                >
                  <Music className="mr-2 h-5 w-5" />
                  <span>Music</span>
                  {user?.isVIP ? null : <span className="ml-1 text-xs text-gray-400">({freeSongsRemaining} free)</span>}
                </Button>
              </div>
            </div>
          </div>

          {/* Chat panel - right side for desktop, slide-in for mobile */}
          {!isMobile && showChat && (
            <div className="hidden md:flex md:flex-col w-80 bg-gray-800 border-gray-700 border-l">
              <div className="border-gray-700 border-b p-3 flex items-center justify-between">
                <h2 className="font-medium">
                  {isConnected ? `Speaking with ${strangerUsername}` : `Welcome, ${user?.username || "Guest"}`}
                </h2>
              </div>

              {/* Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-sm">
                      {isConnected ? "No messages yet. Say hello!" : "Connect with someone to start chatting"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((message) => (
                      <div key={message.id} className="flex flex-col">
                        {message.sender === "stranger" && message.username !== "System" && (
                          <div className="mb-1 flex items-center gap-2">
                            <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-700">
                              <div className="h-full w-full flex items-center justify-center text-white font-bold">
                                {message.username?.charAt(0).toUpperCase() || "S"}
                              </div>
                            </div>
                            <span className="text-sm font-medium">{message.username}</span>
                            {message.sender === "stranger" && message.username !== "System" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-auto h-6 rounded-full bg-yellow-500 px-2 py-0 text-xs text-black hover:bg-yellow-600"
                                onClick={() => sendFriendRequest(message.username || "Unknown")}
                              >
                                +Invite
                              </Button>
                            )}
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[90%] rounded-lg p-2 text-sm",
                            message.sender === "me" ? "ml-auto bg-gray-700" : "bg-gray-700",
                            message.username === "System" ? "bg-gray-600 text-gray-300" : "",
                          )}
                        >
                          {message.isMusic && message.musicData ? (
                            <div className="flex flex-col">
                              <p className="mb-2">{message.text}</p>
                              <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-md">
                                <img
                                  src={message.musicData.albumArt || "/placeholder.svg"}
                                  alt={message.musicData.title}
                                  className="h-10 w-10 rounded-md"
                                />
                                <div>
                                  <p className="font-medium text-xs">{message.musicData.title}</p>
                                  <p className="text-xs text-gray-400">{message.musicData.artist}</p>
                                </div>
                              </div>
                            </div>
                          ) : message.isEmoji ? (
                            <span className="text-2xl">{message.text}</span>
                          ) : message.isImage ? (
                            <div className="w-full overflow-hidden rounded-md">
                              <img
                                src={message.imageUrl || "/placeholder.svg"}
                                alt="Shared image"
                                className="w-full h-auto"
                              />
                            </div>
                          ) : (
                            message.text
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message input */}
              <div className="border-t border-gray-700 p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                    className="bg-gray-700 border-gray-600 focus-visible:ring-gray-500 text-white"
                  />
                  <EmojiPicker onSelect={handleEmojiMemeSelect} />
                  <Button
                    variant="default"
                    size="icon"
                    className="h-10 w-10 bg-yellow-500 hover:bg-yellow-600 text-black"
                    onClick={sendMessage}
                    disabled={!isConnected || !messageInput.trim()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Interest Selector */}
          {showInterestSelector && (
            <InterestSelector onSelect={handleInterestSelect} onClose={() => setShowInterestSelector(false)} />
          )}

          {/* User Profile Card */}
          {showUserProfile && (
            <UserProfileCard
              userId={`stranger-${Date.now()}`}
              username={strangerUsername}
              countryFlag={strangerCountry.flag}
              countryName={strangerCountry.name}
              reputation={strangerReputation}
              currentUserId={userId.toString()}
              onCommend={handleCommendation}
              onKickVote={handleKickVote}
              onClose={() => setShowUserProfile(false)}
            />
          )}

          {/* Notifications */}
          {notifications.map((notification) => (
            <CommendationNotification
              key={notification.id}
              type={notification.type}
              message={notification.message}
              onClose={() => removeNotification(notification.id)}
            />
          ))}

          {/* Modals */}
          {showAuthModal && (
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialError={authError} />
          )}

          {/* Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogoutSuccess}
            microphoneVolume={microphoneVolume}
            speakerVolume={speakerVolume}
            onMicrophoneVolumeChange={setMicrophoneVolume}
            onSpeakerVolumeChange={setSpeakerVolume}
            debugLogs={debugLogs}
            clearDebugLogs={clearDebugLogs}
            onEditProfile={onEditProfile}
            onOpenDatingList={() => setShowDatingList(true)}
          />

          {/* VIP Popup */}
          {isVipPopupOpen && (
            <VipPopup
              isOpen={true}
              onClose={() => setIsVipPopupOpen(false)}
              onSubscribe={handleSubscribe}
              isVIP={isVip}
              subscriptionDate={user?.subscriptionDate}
            />
          )}
          {/* Profile Modal */}
          {isProfileModalOpen && user && (
            <ProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              onSave={(updatedUserData) => {
                setUser(updatedUserData)
                localStorage.setItem("user", JSON.stringify(updatedUserData))
                setIsProfileModalOpen(false)
              }}
              user={user}
              reputation={user.reputation}
            />
          )}
        </div>
      </div>
    </DatingThemeProvider>
  )
}
