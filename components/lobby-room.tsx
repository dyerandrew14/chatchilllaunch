"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, MessageSquare, Clock, ArrowRight, Loader2, UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Interest } from "@/components/interest-selector"
import { cn } from "@/lib/utils"

interface LobbyUser {
  id: string
  name: string
  avatar?: string
  country: string
  countryFlag: string
  isReady: boolean
  joinedAt: Date
}

interface LobbyRoomProps {
  interest: Interest
  onStartChat: () => void
  onChangeInterest: () => void
  onClose: () => void
}

export function LobbyRoom({ interest, onStartChat, onChangeInterest, onClose }: LobbyRoomProps) {
  const [users, setUsers] = useState<LobbyUser[]>([])
  const [isReady, setIsReady] = useState(false)
  const [messages, setMessages] = useState<{ id: string; user: string; text: string }[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading lobby data
  useEffect(() => {
    const timer = setTimeout(() => {
      // Generate random users for the lobby
      const randomUsers: LobbyUser[] = Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => {
        const countries = ["🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇩🇪", "🇫🇷", "🇯🇵", "🇧🇷"]
        const countryNames = ["USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "Brazil"]
        const randomCountryIndex = Math.floor(Math.random() * countries.length)

        return {
          id: `user-${i}`,
          name: `User${Math.floor(Math.random() * 1000)}`,
          country: countryNames[randomCountryIndex],
          countryFlag: countries[randomCountryIndex],
          isReady: Math.random() > 0.5,
          joinedAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 30)),
        }
      })

      // Add some welcome messages
      const welcomeMessages = [
        {
          id: "msg-1",
          user: "System",
          text: `Welcome to the ${interest.name} lobby! Chat with others who share your interest.`,
        },
        {
          id: "msg-2",
          user: randomUsers[0]?.name || "User123",
          text: "Hey everyone! Anyone want to chat about the latest developments?",
        },
      ]

      setUsers(randomUsers)
      setMessages(welcomeMessages)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [interest])

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

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-4xl p-6 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
          <h3 className="text-xl font-medium text-white">Joining {interest.name} Lobby</h3>
          <p className="text-gray-400 mt-2">Finding people who share your interest...</p>
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
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                `bg-gradient-to-br ${interest.color}`,
              )}
            >
              {interest.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{interest.name} Lobby</h2>
              <p className="text-sm text-gray-400">{users.length + 1} people in this room</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChangeInterest()
              }}
              variant="outline"
              size="sm"
              className="text-gray-400 border-gray-700 hover:bg-gray-800"
            >
              Change Interest
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
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                  </motion.div>
                ))}
              </AnimatePresence>
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
                </div>

                {/* Other users */}
                {users.map((user) => (
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
                    <div className="text-xs text-gray-500 mt-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Joined {formatTime(user.joinedAt)}
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

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onStartChat()
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
              >
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
