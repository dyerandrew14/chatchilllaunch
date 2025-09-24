"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { X, CreditCard, Check, Crown, Music, Users, Filter } from "lucide-react"

// Import country data
import { COUNTRIES } from "@/lib/constants"

// Add this import at the top
import { ReputationDisplay } from "@/components/reputation-display"
import type { UserReputation } from "@/types/user-types"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: any) => void
  user: any | null
  // Add this to the ProfileModal props interface
  reputation?: UserReputation
}

export function ProfileModal({ isOpen, onClose, onSave, user, ...props }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)

  // Profile form state
  const [username, setUsername] = useState("")
  const [country, setCountry] = useState(COUNTRIES[0].code)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [socialMedia, setSocialMedia] = useState({
    instagram: "",
    snapchat: "",
    facebook: "",
    discord: "",
  })

  // Load user data if available
  useEffect(() => {
    if (user) {
      setUsername(user.username || "")
      setCountry(user.country || COUNTRIES[0].code)
      setProfileImagePreview(user.profileImage || null)
      setSocialMedia({
        instagram: user.instagram || "",
        snapchat: user.snapchat || "",
        facebook: user.facebook || "",
        discord: user.discord || "",
      })
    }
  }, [user])

  if (!isOpen) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Get selected country data
    const selectedCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0]

    // Simulate API call
    setTimeout(() => {
      const userData = {
        ...user,
        username,
        country,
        countryFlag: selectedCountry.flag,
        countryName: selectedCountry.name,
        profileImage: profileImagePreview,
        ...socialMedia,
        isLoggedIn: true,
      }

      onSave(userData)
      setIsLoading(false)
      onClose()
    }, 1000)
  }

  const handleSubscribe = () => {
    setIsSubscribing(true)

    // Simulate payment processing
    setTimeout(() => {
      const updatedUser = {
        ...user,
        isVIP: true,
        subscriptionDate: new Date().toISOString(),
      }

      onSave(updatedUser)
      setIsSubscribing(false)
      setActiveTab("profile")
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-800 bg-gray-900 text-white relative">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 rounded-full" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center pb-2">
          <Image
            src="/images/logo.png"
            alt="ChatChill Logo"
            width={200}
            height={80}
            className="h-16 w-auto mx-auto mb-4"
          />
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription className="text-gray-400">Customize your ChatChill experience</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="vip">
                <Crown className="h-4 w-4 mr-1 text-yellow-500" />
                VIP
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview || "/placeholder.svg"}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-3xl">{username.charAt(0).toUpperCase() || "?"}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="profile-image" className="block mb-1">
                      Profile Picture
                    </Label>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Your display name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code} className="flex items-center gap-2">
                          <span className="mr-2">{country.flag}</span>
                          <span>{country.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add this section in the form, before the social media section */}
                <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Your Reputation</h3>

                  {props.user?.reputation ? (
                    <ReputationDisplay reputation={props.user.reputation} showDetails={true} />
                  ) : (
                    <div className="text-gray-400 text-sm">
                      Start chatting to build your reputation! You'll earn points when others rate you positively.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Social Media</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="instagram" className="text-sm text-gray-400">
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        placeholder="@yourusername"
                        value={socialMedia.instagram}
                        onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="snapchat" className="text-sm text-gray-400">
                        Snapchat
                      </Label>
                      <Input
                        id="snapchat"
                        placeholder="yourusername"
                        value={socialMedia.snapchat}
                        onChange={(e) => setSocialMedia({ ...socialMedia, snapchat: e.target.value })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="facebook" className="text-sm text-gray-400">
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        placeholder="yourusername"
                        value={socialMedia.facebook}
                        onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="discord" className="text-sm text-gray-400">
                        Discord
                      </Label>
                      <Input
                        id="discord"
                        placeholder="username#0000"
                        value={socialMedia.discord}
                        onChange={(e) => setSocialMedia({ ...socialMedia, discord: e.target.value })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="vip" className="space-y-4">
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-4 border border-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=400')] opacity-10 bg-center"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                      ChatChill VIP
                    </h3>
                  </div>
                  <p className="text-purple-200 mb-4">Unlock premium features and enhance your experience</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white text-sm">Filter users by gender, country, and interests</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white text-sm">Music control - override other users' music</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white text-sm">Ad-free experience with priority matching</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white text-sm">Exclusive profile badge and chat effects</p>
                    </div>
                  </div>

                  <div className="bg-black/30 p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-purple-200">Monthly subscription</span>
                      <span className="text-white font-bold">$3.99</span>
                    </div>
                    <p className="text-purple-300 text-xs">Cancel anytime. Billed monthly.</p>
                  </div>

                  {user?.isVIP ? (
                    <div className="bg-green-900/50 border border-green-700 rounded-lg p-3 text-center">
                      <Check className="h-5 w-5 text-green-400 mx-auto mb-1" />
                      <p className="text-green-300 font-medium">You are a VIP member!</p>
                      <p className="text-green-400 text-xs mt-1">
                        Subscribed since{" "}
                        {user.subscriptionDate ? new Date(user.subscriptionDate).toLocaleDateString() : "today"}
                      </p>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
                      onClick={handleSubscribe}
                      disabled={isSubscribing}
                    >
                      {isSubscribing ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Subscribe Now
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {user?.isVIP && (
                <div className="space-y-4 mt-4">
                  <h3 className="font-medium text-lg">VIP Settings</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-purple-400" />
                        <Label className="font-medium">Filter by gender</Label>
                      </div>
                      <Switch checked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-400" />
                        <Label className="font-medium">Filter by country</Label>
                      </div>
                      <Switch checked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-purple-400" />
                        <Label className="font-medium">Music override</Label>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
