"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, MessageSquare, Clock, ArrowRight, Loader2, UserPlus, X, Globe, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ReputationDisplay } from "@/components/reputation-display"
import { cn } from "@/lib/utils"
import type { UserReputation } from "@/types/user-types"

interface LobbyUser {
  id: string
  name: string
  avatar?: string
  country: string
  countryFlag: string
  isReady: boolean
  joinedAt: Date
  reputation: UserReputation
}

interface GeneralLobbyProps {
  onStartChat: () => void
  onSelectInterest: () => void
  onClose: () => void
}

export function GeneralLobby({ onStartChat, onSelectInterest, onClose }: GeneralLobbyProps) {
  const [users, setUsers] = useState<LobbyUser[]>([])
  const [isReady, setIsReady] = useState(false)
  const [messages, setMessages] = useState<{ id: string; user: string; text: string }[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("")

  // Simulate loading lobby data
  useEffect(() => {
    const timer = setTimeout(() => {
      // Generate random users for the lobby
      const randomUsers: LobbyUser[] = Array.from({ length: Math.floor(Math.random() * 15) + 10 }, (_, i) => {
        const countries = ["🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇩🇪", "🇫🇷", "🇯🇵", "🇧🇷"]
        const countryNames = ["USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "Brazil"]
        const randomCountryIndex = Math.floor(Math.random() * countries.length)
        const level = Math.floor(Math.random() * 5) + 1

        return {
          id: `user-${i}`,
          name: `User${Math.floor(Math.random() * 1000)}`,
          country: countryNames[randomCountryIndex],
          countryFlag: countries[randomCountryIndex],
          isReady: Math.random() > 0.5,
          joinedAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 30)),
          reputation: {
            level,
            points: level * 100 - Math.floor(Math.random() * 50),
            positiveRatings: Math.floor(Math.random() * 50) + 5,
            negativeRatings: Math.floor(Math.random() * 5),
            badges: [],
            interestGroupBans: [],
          },
        }
      })

      // Add some welcome messages
      const welcomeMessages = [
        {
          id: "msg-1",
          user: "System",
          text: `Welcome to the General Lobby! Chat with others or find an interest group.`,
        },
        {
          id: "msg-2",
          user: randomUsers[0]?.name || "User123",
          text: "Hey everyone! Anyone want to chat?",
        },
      ]

      setUsers(randomUsers)
      setMessages(welcomeMessages)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        user: "You",
        text: messageInput,
      },
    ])

    setMessageInput("")

    // Simulate a response after a short delay
    setTimeout(
      () => {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        if (randomUser) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              user: randomUser.name,
              text: "That's interesting! I'd love to chat more about that.",
            },
          ])
        }
      },
      2000 + Math.random() * 3000,
    )
  }

  const toggleReady = () => {
    setIsReady(!isReady)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const filteredUsers = filter
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(filter.toLowerCase()) ||
          user.country.toLowerCase().includes(filter.toLowerCase()),
      )
    : users

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-4xl p-6 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
          <h3 className="text-xl font-medium text-white">Joining General Lobby</h3>
          <p className="text-gray-400 mt-2">Finding people to chat with...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-5xl h-[80vh] rounded-xl bg-gray-900 border border-gray-800 shadow-2xl flex flex-col"
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gradient-to-br from-blue-500 to-purple-700">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">General Lobby</h2>
              <p className="text-sm text-gray-400">{users.length + 1} people online</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectInterest}
              className="text-gray-400 border-gray-700 hover:bg-gray-800"
            >
              Find Interest Group
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:bg-gray-800">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left side - Chat */}
          <div className="w-2/3 border-r border-gray-800 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "mb-3 max-w-[80%] rounded-lg p-3",
                    message.user === "You"
                      ? "ml-auto bg-blue-600 text-white"
                      : message.user === "System"
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-700 text-white",
                  )}
                >
                  {message.user !== "You" && <div className="font-medium text-xs mb-1">{message.user}</div>}
                  <div>{message.text}</div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message to the lobby..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <Button onClick={handleSendMessage} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>

          {/* Right side - Users and controls */}
          <div className="w-1/3 flex flex-col">
            <div className="p-3 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-medium text-white mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                People in Lobby
              </h3>

              <div className="space-y-3">
                {/* Current user */}
                <div className="bg-gray-800 rounded-lg p-3 border border-yellow-500/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">You</div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <span className="mr-1">🇺🇸</span> USA
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isReady ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400",
                      )}
                    >
                      {isReady ? "Ready" : "Not Ready"}
                    </div>
                  </div>
                  <div className="mt-2">
                    <ReputationDisplay
                      reputation={{
                        level: 2,
                        points: 120,
                        positiveRatings: 15,
                        negativeRatings: 1,
                        badges: [],
                        interestGroupBans: [],
                      }}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Other users */}
                {filteredUsers.map((user) => (
                  <div key={user.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-xs text-gray-400 flex items-center">
                            <span className="mr-1">{user.countryFlag}</span> {user.country}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            user.isReady ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400",
                          )}
                        >
                          {user.isReady ? "Ready" : "Not Ready"}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <ReputationDisplay reputation={user.reputation} size="sm" />
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Joined {formatTime(user.joinedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="mb-4">
                <Button
                  onClick={toggleReady}
                  variant={isReady ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    isReady
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "border-green-600 text-green-500 hover:bg-green-900/20",
                  )}
                >
                  {isReady ? "Ready to Chat" : "Mark as Ready"}
                </Button>
              </div>

              <Button onClick={onStartChat} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium">
                Start Random Chat
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
