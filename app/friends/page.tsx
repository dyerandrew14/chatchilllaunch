"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Search, UserPlus, X, Check, Mail } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Friend = {
  id: string
  name: string
  online: boolean
}

type FriendRequest = {
  id: string
  name: string
  incoming: boolean
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])

  // Load friends data if available
  useEffect(() => {
    const storedFriends = localStorage.getItem("friends")
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends))
    } else {
      // Default friends for demo
      const defaultFriends = [
        { id: "1", name: "Alex123", online: true },
        { id: "2", name: "Jordan456", online: false },
        { id: "3", name: "Taylor789", online: true },
      ]
      setFriends(defaultFriends)
      localStorage.setItem("friends", JSON.stringify(defaultFriends))
    }

    // Load friend requests
    const storedRequests = localStorage.getItem("friendRequests")
    if (storedRequests) {
      setFriendRequests(JSON.parse(storedRequests))
    } else {
      // Default requests for demo
      const defaultRequests = [
        { id: "101", name: "Riley222", incoming: true },
        { id: "102", name: "Casey333", incoming: false },
      ]
      setFriendRequests(defaultRequests)
      localStorage.setItem("friendRequests", JSON.stringify(defaultRequests))
    }
  }, [])

  const handleAddFriend = () => {
    if (!searchQuery.trim()) return

    // Check if already a friend
    if (friends.some((friend) => friend.name.toLowerCase() === searchQuery.toLowerCase())) {
      alert("This user is already your friend")
      return
    }

    // Add to outgoing requests
    const newRequest = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      name: searchQuery,
      incoming: false,
    }

    const updatedRequests = [...friendRequests, newRequest]
    setFriendRequests(updatedRequests)
    localStorage.setItem("friendRequests", JSON.stringify(updatedRequests))
    setSearchQuery("")
  }

  const acceptFriendRequest = (request: FriendRequest) => {
    // Add to friends
    const newFriend = {
      id: request.id,
      name: request.name,
      online: Math.random() > 0.5, // Random online status for demo
    }

    const updatedFriends = [...friends, newFriend]
    setFriends(updatedFriends)
    localStorage.setItem("friends", JSON.stringify(updatedFriends))

    // Remove from requests
    const updatedRequests = friendRequests.filter((req) => req.id !== request.id)
    setFriendRequests(updatedRequests)
    localStorage.setItem("friendRequests", JSON.stringify(updatedRequests))
  }

  const rejectFriendRequest = (requestId: string) => {
    const updatedRequests = friendRequests.filter((req) => req.id !== requestId)
    setFriendRequests(updatedRequests)
    localStorage.setItem("friendRequests", JSON.stringify(updatedRequests))
  }

  const removeFriend = (friendId: string) => {
    const updatedFriends = friends.filter((friend) => friend.id !== friendId)
    setFriends(updatedFriends)
    localStorage.setItem("friends", JSON.stringify(updatedFriends))
  }

  const filteredFriends = friends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const incomingRequests = friendRequests.filter((req) => req.incoming)
  const outgoingRequests = friendRequests.filter((req) => !req.incoming)

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="py-2 px-3 border-b border-gray-800">
        <div className="container mx-auto flex items-center">
          <Link href="/profile" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Profile</span>
          </Link>
          <div className="mx-auto">
            <Image src="/images/logo.png" alt="ChatChill Logo" width={200} height={80} className="h-16 w-auto" />
          </div>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>
      </header>

      <main className="container mx-auto flex flex-1 p-4">
        <Card className="w-full border-gray-800 bg-gray-900 text-white">
          <CardHeader>
            <CardTitle>Friends</CardTitle>
            <CardDescription className="text-gray-400">Manage your friends and friend requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label htmlFor="search-friends" className="text-white mb-2 block">
                Add Friend
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="search-friends"
                    placeholder="Enter username"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button
                  onClick={handleAddFriend}
                  className="bg-yellow-500 text-black hover:bg-yellow-600"
                  disabled={!searchQuery.trim()}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="all" className="text-white data-[state=active]:bg-gray-700">
                  All Friends ({friends.length})
                </TabsTrigger>
                <TabsTrigger value="incoming" className="text-white data-[state=active]:bg-gray-700">
                  Incoming ({incomingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="outgoing" className="text-white data-[state=active]:bg-gray-700">
                  Outgoing ({outgoingRequests.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {filteredFriends.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    {searchQuery ? "No friends match your search" : "You don't have any friends yet"}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFriends.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                              {friend.name.charAt(0).toUpperCase()}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${friend.online ? "bg-green-500" : "bg-gray-500"}`}
                            ></span>
                          </div>
                          <div>
                            <p className="font-medium">{friend.name}</p>
                            <p className="text-xs text-gray-400">{friend.online ? "Online" : "Offline"}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 bg-transparent border-gray-700 hover:bg-gray-700"
                          >
                            <Mail className="h-4 w-4" />
                            <span className="sr-only">Message</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 bg-transparent border-gray-700 hover:bg-gray-700 hover:text-red-500"
                            onClick={() => removeFriend(friend.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="incoming" className="mt-4">
                {incomingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No incoming friend requests</div>
                ) : (
                  <div className="space-y-3">
                    {incomingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                            {request.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium">{request.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 bg-transparent border-green-700 text-green-500 hover:bg-green-900 hover:text-green-400"
                            onClick={() => acceptFriendRequest(request)}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Accept</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 bg-transparent border-red-700 text-red-500 hover:bg-red-900 hover:text-red-400"
                            onClick={() => rejectFriendRequest(request.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Reject</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="outgoing" className="mt-4">
                {outgoingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No outgoing friend requests</div>
                ) : (
                  <div className="space-y-3">
                    {outgoingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                            {request.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium">{request.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 bg-transparent border-gray-700 hover:bg-gray-700 hover:text-red-500"
                            onClick={() => rejectFriendRequest(request.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="ml-1">Cancel</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
