"use client"

import { useState } from "react"
import { X, Heart, MessageSquare, Phone, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface DatingProfile {
  id: string
  name: string
  age: number
  location: string
  bio: string
  interests: string[]
  avatar?: string
  lastActive: string
  isSuperLiked: boolean
  isMatch: boolean
}

interface DatingListModalProps {
  isOpen: boolean
  onClose: () => void
  onMessage: (id: string) => void
  onCall: (id: string) => void
}

export function DatingListModal({ isOpen, onClose, onMessage, onCall }: DatingListModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"likes" | "matches">("likes")

  // Mock data for dating profiles
  const [datingProfiles] = useState<DatingProfile[]>([
    {
      id: "1",
      name: "Alex",
      age: 28,
      location: "New York, USA",
      bio: "Love hiking and photography. Looking for someone to share adventures with!",
      interests: ["Hiking", "Photography", "Travel"],
      lastActive: "2 hours ago",
      isSuperLiked: true,
      isMatch: true,
    },
    {
      id: "2",
      name: "Jordan",
      age: 25,
      location: "London, UK",
      bio: "Music lover and coffee enthusiast. Let's chat about our favorite bands!",
      interests: ["Music", "Coffee", "Art"],
      lastActive: "Just now",
      isSuperLiked: true,
      isMatch: false,
    },
    {
      id: "3",
      name: "Taylor",
      age: 30,
      location: "Sydney, Australia",
      bio: "Beach lover and surfer. Looking for someone to enjoy sunsets with.",
      interests: ["Surfing", "Beach", "Fitness"],
      lastActive: "5 hours ago",
      isSuperLiked: true,
      isMatch: true,
    },
  ])

  if (!isOpen) return null

  const filteredProfiles = datingProfiles.filter((profile) => {
    // Filter by search query
    if (searchQuery && !profile.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by active tab
    if (activeTab === "matches" && !profile.isMatch) {
      return false
    }

    return true
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Heart className="h-5 w-5 text-pink-500 mr-2 fill-pink-500" />
            Dating List
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === "likes" ? "default" : "outline"}
              className={activeTab === "likes" ? "bg-pink-600 hover:bg-pink-700" : ""}
              onClick={() => setActiveTab("likes")}
            >
              Super Likes
            </Button>
            <Button
              variant={activeTab === "matches" ? "default" : "outline"}
              className={activeTab === "matches" ? "bg-pink-600 hover:bg-pink-700" : ""}
              onClick={() => setActiveTab("matches")}
            >
              Matches
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {activeTab === "matches"
                ? "No matches found. Keep sending Super Likes!"
                : "No super likes found. Try a different search."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProfiles.map((profile) => (
                <div key={profile.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={profile.avatar || `/placeholder.svg?height=64&width=64&query=${profile.name}`}
                        alt={profile.name}
                      />
                      <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          {profile.name}, {profile.age}
                        </h3>
                        {profile.isMatch && <Badge className="bg-green-600">Match</Badge>}
                      </div>
                      <p className="text-sm text-gray-400">{profile.location}</p>
                      <p className="text-sm mt-1 line-clamp-2">{profile.bio}</p>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {profile.interests.map((interest) => (
                          <Badge key={interest} variant="outline" className="bg-gray-700 text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-gray-400">Active {profile.lastActive}</span>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 bg-gray-700 hover:bg-gray-600"
                        onClick={() => onMessage(profile.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>

                      {profile.isMatch && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 bg-green-900/50 hover:bg-green-800 text-green-400 border-green-700"
                          onClick={() => onCall(profile.id)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
