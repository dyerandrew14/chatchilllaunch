"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Users, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser, profile: authProfile, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [username, setUsername] = useState("")
  const [socialMedia, setSocialMedia] = useState({
    instagram: "",
    snapchat: "",
    facebook: "",
    discord: "",
  })
  const supabase = createClientComponentClient()

  // Load user data from auth context
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if we have auth data
        if (authUser && authProfile) {
          setUsername(authProfile.username || authUser.email?.split("@")[0] || "")
          setSocialMedia({
            instagram: authProfile.instagram || "",
            snapchat: authProfile.snapchat || "",
            facebook: authProfile.facebook || "",
            discord: authProfile.discord || "",
          })
          setIsLoading(false)
          return
        }

        // If not, check session directly
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          // Redirect to home if not logged in
          router.push("/")
          return
        }

        // Get profile data
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (profileData) {
          setUsername(profileData.username || session.user.email?.split("@")[0] || "")
          setSocialMedia({
            instagram: profileData.instagram || "",
            snapchat: profileData.snapchat || "",
            facebook: profileData.facebook || "",
            discord: profileData.discord || "",
          })
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [authUser, authProfile, router, supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/")
        return
      }

      // Update profile in Supabase
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        username,
        instagram: socialMedia.instagram,
        snapchat: socialMedia.snapchat,
        facebook: socialMedia.facebook,
        discord: socialMedia.discord,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      // If we have updateProfile from auth context, use it
      if (updateProfile) {
        await updateProfile({
          username,
          instagram: socialMedia.instagram,
          snapchat: socialMedia.snapchat,
          facebook: socialMedia.facebook,
          discord: socialMedia.discord,
        })
      }

      // Navigate back to home
      router.push("/")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="py-2 px-3 border-b border-gray-800">
        <div className="container mx-auto flex items-center">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Chat</span>
          </Link>
          <div className="mx-auto">
            <Image src="/images/logo.png" alt="ChatChill Logo" width={200} height={80} className="h-16 w-auto" />
          </div>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>
      </header>

      <main className="container mx-auto flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-800 bg-gray-900 text-white">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription className="text-gray-400">
              Update your profile information and social media handles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-white">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your display name"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="grid gap-4">
                  <h3 className="text-sm font-medium text-gray-300">Social Media</h3>

                  <div className="grid gap-2">
                    <Label htmlFor="instagram" className="text-white">
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={socialMedia.instagram}
                      onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                      placeholder="@yourusername"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="snapchat" className="text-white">
                      Snapchat
                    </Label>
                    <Input
                      id="snapchat"
                      value={socialMedia.snapchat}
                      onChange={(e) => setSocialMedia({ ...socialMedia, snapchat: e.target.value })}
                      placeholder="yourusername"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="facebook" className="text-white">
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={socialMedia.facebook}
                      onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                      placeholder="yourusername"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="discord" className="text-white">
                      Discord
                    </Label>
                    <Input
                      id="discord"
                      value={socialMedia.discord}
                      onChange={(e) => setSocialMedia({ ...socialMedia, discord: e.target.value })}
                      placeholder="username#0000"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <Button type="submit" className="bg-yellow-500 text-black hover:bg-yellow-600" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Link href="/friends" className="flex w-full items-center justify-center">
              <Button variant="outline" className="w-full bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
                <Users className="mr-2 h-4 w-4" />
                Manage Friends
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
