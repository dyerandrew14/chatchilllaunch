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
  signOut: () => Promise<void>
  updateProfile: (data: ProfileUpdateData) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [supabase] = useState(() => createClientComponentClient<Database>())

  useEffect(() => {
    const getSession = async () => {
      try {
        setIsLoading(true)

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (session) {
        setSession(session)
        setUser(session.user)

        // Fetch user profile on auth change
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
      } else {
        setSession(null)
        setUser(null)
        setProfile(null)
      }

      setIsLoading(false)
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
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

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, error, signOut, updateProfile }}>
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
