"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User, Session } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  instagram: string | null
  snapchat: string | null
  facebook: string | null
  discord: string | null
  country: string | null
  is_vip: boolean
  subscription_date: string | null
  created_at: string
  updated_at: string
}

type ProfileUpdateData = {
  username?: string
  avatar_url?: string
  instagram?: string
  snapchat?: string
  facebook?: string
  discord?: string
  country?: string
  is_vip?: boolean
  subscription_date?: string
}

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  error: Error | null
  isDevMode: boolean
  signOut: () => Promise<void>
  updateProfile: (data: ProfileUpdateData) => Promise<void>
  enableDevMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isDevMode, setIsDevMode] = useState(false)
  const [supabase] = useState(() => {
    try {
      return createClientComponentClient<Database>()
    } catch (error) {
      console.warn("Supabase configuration missing, running in demo mode")
      return null
    }
  })

  useEffect(() => {
    const getSession = async () => {
      try {
        setIsLoading(true)

        // Check if dev mode is enabled in localStorage
        const isDevModeStored = localStorage.getItem("chatchill-dev-mode") === "true"
        if (isDevModeStored) {
          const storedUser = localStorage.getItem("chatchill-dev-user")
          const storedSession = localStorage.getItem("chatchill-dev-session")
          const storedProfile = localStorage.getItem("chatchill-dev-profile")
          
          if (storedUser && storedSession && storedProfile) {
            setUser(JSON.parse(storedUser))
            setSession(JSON.parse(storedSession))
            setProfile(JSON.parse(storedProfile))
            setIsDevMode(true)
            setIsLoading(false)
            return
          }
        }

        // If Supabase is not configured, skip authentication
        if (!supabase) {
          setIsLoading(false)
          return
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session) {
          setSession(session)
          setUser(session.user)

          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (profileError && profileError.code !== "PGRST116") {
            console.error("Error fetching profile:", profileError)
          }

          if (profileData) {
            setProfile(profileData as Profile)
          } else {
            // Create a profile if it doesn't exist
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .upsert({
                id: session.user.id,
                username: session.user.email?.split("@")[0] || "User",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single()

            if (createError) {
              console.error("Error creating profile:", createError)
            } else if (newProfile) {
              setProfile(newProfile as Profile)
            }
          }
        }
      } catch (err) {
        console.error("Auth error:", err)
        setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      } finally {
        setIsLoading(false)
      }
    }

    // Call getSession immediately
    getSession()

    // Set up auth state change listener
    let subscription: any = null
    if (supabase) {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event)

        if (session) {
          setSession(session)
          setUser(session.user)

          // Fetch user profile on auth change
          if (supabase) {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single()

            if (profileError && profileError.code !== "PGRST116") {
              console.error("Error fetching profile:", profileError)
            }

            if (profileData) {
              setProfile(profileData as Profile)
            }
          }
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }

        setIsLoading(false)
      })
      subscription = authSubscription
    }

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [supabase])

  const signOut = async () => {
    try {
      if (isDevMode) {
        // Clear dev mode from localStorage
        localStorage.removeItem("chatchill-dev-mode")
        localStorage.removeItem("chatchill-dev-user")
        localStorage.removeItem("chatchill-dev-session")
        localStorage.removeItem("chatchill-dev-profile")
        setIsDevMode(false)
      } else if (supabase) {
        await supabase.auth.signOut()
      }
      setUser(null)
      setSession(null)
      setProfile(null)
    } catch (err) {
      console.error("Error signing out:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred during sign out"))
    }
  }

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!user) throw new Error("User not authenticated")
    if (!supabase && !isDevMode) throw new Error("Supabase not configured")

    if (isDevMode) {
      // Update profile in dev mode
      setProfile(prev => prev ? { ...prev, ...data, updated_at: new Date().toISOString() } : null)
      return
    }

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...data,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      // Refresh profile data
      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (fetchError) throw fetchError

      setProfile(updatedProfile as Profile)
    } catch (err) {
      console.error("Error updating profile:", err)
      throw err
    }
  }

  const enableDevMode = () => {
    // Create a mock user and session for development
    const mockUser = {
      id: "dev-user-123",
      email: "dev@example.com",
      user_metadata: {},
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User

    const mockSession = {
      access_token: "dev-token",
      refresh_token: "dev-refresh-token",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      user: mockUser,
    } as Session

    const mockProfile = {
      id: "dev-user-123",
      username: "DevUser",
      avatar_url: null,
      instagram: null,
      snapchat: null,
      facebook: null,
      discord: null,
      country: "US",
      is_vip: false,
      subscription_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile

    setUser(mockUser)
    setSession(mockSession)
    setProfile(mockProfile)
    setIsDevMode(true)
    setIsLoading(false)
    
    // Store in localStorage so it persists across page reloads
    localStorage.setItem("chatchill-dev-mode", "true")
    localStorage.setItem("chatchill-dev-user", JSON.stringify(mockUser))
    localStorage.setItem("chatchill-dev-session", JSON.stringify(mockSession))
    localStorage.setItem("chatchill-dev-profile", JSON.stringify(mockProfile))
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, error, isDevMode, signOut, updateProfile, enableDevMode }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
