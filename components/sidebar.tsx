"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  X,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Volume2,
  Mic,
  Crown,
  Filter,
  CreditCard,
  Check,
  Users,
  Music,
  Heart,
} from "lucide-react"
import Image from "next/image"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  microphoneVolume: number
  speakerVolume: number
  onMicrophoneVolumeChange: (value: number) => void
  onSpeakerVolumeChange: (value: number) => void
  debugLogs: string[]
  clearDebugLogs: () => void
  onEditProfile: () => void
  onOpenDatingList: () => void
}

export function Sidebar({
  isOpen,
  onClose,
  onLogout,
  microphoneVolume,
  speakerVolume,
  onMicrophoneVolumeChange,
  onSpeakerVolumeChange,
  debugLogs,
  clearDebugLogs,
  onEditProfile,
  onOpenDatingList,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const { user, profile, signOut } = useAuth()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  // Handle logout
  const handleLogout = async () => {
    await signOut()
    onLogout()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-80 bg-gray-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="ChatChill Logo" width={160} height={64} className="h-12 w-auto" />
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gray-700">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="vip" className="data-[state=active]:bg-gray-700">
              <Crown className="mr-2 h-4 w-4 text-yellow-500" />
              VIP
            </TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-gray-700">
              <HelpCircle className="mr-2 h-4 w-4" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="p-4">
            {profile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold overflow-hidden">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url || "/placeholder.svg"}
                          alt={profile.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        profile.username?.charAt(0).toUpperCase() || "?"
                      )}
                    </div>
                    {profile.is_vip && (
                      <div className="absolute -top-1 -right-1 bg-yellow-500 text-black rounded-full p-0.5">
                        <Crown className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{profile.username || "User"}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <span className="text-lg">🌎</span>
                      <span>Global</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Social Media</h4>
                  <div className="space-y-1">
                    {profile.instagram && (
                      <p className="text-sm">
                        <span className="text-gray-400">Instagram:</span> {profile.instagram}
                      </p>
                    )}
                    {profile.snapchat && (
                      <p className="text-sm">
                        <span className="text-gray-400">Snapchat:</span> {profile.snapchat}
                      </p>
                    )}
                    {profile.facebook && (
                      <p className="text-sm">
                        <span className="text-gray-400">Facebook:</span> {profile.facebook}
                      </p>
                    )}
                    {profile.discord && (
                      <p className="text-sm">
                        <span className="text-gray-400">Discord:</span> {profile.discord}
                      </p>
                    )}
                    {!profile.instagram && !profile.snapchat && !profile.facebook && !profile.discord && (
                      <p className="text-sm text-gray-500">No social media accounts linked</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  {profile.is_vip && (
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={onOpenDatingList}>
                      <Heart className="mr-2 h-4 w-4 fill-white" />
                      Dating List
                    </Button>
                  )}

                  <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-600" onClick={onEditProfile}>
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <p className="text-center text-gray-400">You are not signed in</p>
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={onEditProfile}>
                  Sign In
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Rest of the tabs content remains the same */}
          <TabsContent value="settings" className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Audio Settings</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center">
                      <Mic className="mr-2 h-4 w-4" />
                      Microphone Volume
                    </label>
                    <span className="text-xs text-gray-400">{microphoneVolume}%</span>
                  </div>
                  <Slider
                    value={[microphoneVolume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => onMicrophoneVolumeChange(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center">
                      <Volume2 className="mr-2 h-4 w-4" />
                      Speaker Volume
                    </label>
                    <span className="text-xs text-gray-400">{speakerVolume}%</span>
                  </div>
                  <Slider
                    value={[speakerVolume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => onSpeakerVolumeChange(value[0])}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Privacy Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Allow Friend Requests</label>
                  <Switch checked={true} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Debug Information</h3>
                <Button variant="outline" size="sm" onClick={clearDebugLogs} className="text-xs">
                  Clear Logs
                </Button>
              </div>
              <div className="bg-gray-800 p-3 rounded-md text-sm h-40 overflow-y-auto">
                {debugLogs.length === 0 ? (
                  <p className="text-gray-500">No logs yet</p>
                ) : (
                  <div className="space-y-1">
                    {debugLogs.map((log, index) => (
                      <p key={index} className="font-mono text-xs">
                        {log}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vip" className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
            {/* VIP content remains the same */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-4 border border-purple-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=400')] opacity-10 bg-center"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-xl font-bold text-white">ChatChill VIP</h3>
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
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-white text-sm">Send Super Likes and access your Dating List</p>
                  </div>
                </div>

                <div className="bg-black/30 p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-purple-200">Monthly subscription</span>
                    <span className="text-white font-bold">$3.99</span>
                  </div>
                  <p className="text-purple-300 text-xs">Cancel anytime. Billed monthly.</p>
                </div>

                {profile?.is_vip ? (
                  <div className="bg-green-900/50 border border-green-700 rounded-lg p-3 text-center">
                    <Check className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <p className="text-green-300 font-medium">You are a VIP member!</p>
                    {profile.subscription_date && (
                      <p className="text-green-400 text-xs mt-1">
                        Subscribed since {new Date(profile.subscription_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
                    onClick={onEditProfile}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscribe Now
                  </Button>
                )}
              </div>
            </div>

            {profile?.is_vip && (
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-purple-400 fill-purple-400" />
                      <Label className="font-medium">Super Likes</Label>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="faq" className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
            {/* FAQ content remains the same */}
            <h3 className="text-lg font-medium">Frequently Asked Questions</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">What is ChatChill?</h4>
                <p className="text-sm text-gray-400">
                  ChatChill is a platform that allows you to video chat with random people from around the world. It's a
                  great way to meet new friends and have interesting conversations.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">How do I start a chat?</h4>
                <p className="text-sm text-gray-400">
                  Simply click the "Start" button on the main screen. You'll be connected with a random person who is
                  also looking to chat. If you want to end the current conversation and find someone new, click the
                  "Next Chat" button.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Is ChatChill free to use?</h4>
                <p className="text-sm text-gray-400">
                  Yes, ChatChill is completely free to use. We also offer a VIP subscription for $3.99/month that gives
                  you access to premium features like filtering users by gender and country, music control, and more.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">How do I add someone as a friend?</h4>
                <p className="text-sm text-gray-400">
                  When you're chatting with someone, you can click the "+Invite" button next to their name to send them
                  a friend request. If they accept, they'll be added to your friends list.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">What are Super Likes?</h4>
                <p className="text-sm text-gray-400">
                  Super Likes are a VIP feature that allows you to express special interest in someone. When you Super
                  Like someone, they'll be added to your Dating List, and if they Super Like you back, it's a match! You
                  can then chat or call them directly.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">How does the music feature work?</h4>
                <p className="text-sm text-gray-400">
                  Click the "Music" button to open the music panel. You can select a track to play, and it will be
                  audible to both you and the person you're chatting with. You can adjust the volume of your music and
                  the other person's audio separately.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Can I report inappropriate behavior?</h4>
                <p className="text-sm text-gray-400">
                  Yes, we take user safety seriously. If someone is behaving inappropriately, you can report them by
                  clicking the report button during your chat. Our moderation team will review the report and take
                  appropriate action.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">How do I share my social media?</h4>
                <p className="text-sm text-gray-400">
                  You can add your social media handles in your profile settings. During a chat, you can click on the
                  social media buttons in the chat panel to share your handles with the person you're chatting with.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
