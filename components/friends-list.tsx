"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Video, UserPlus, Phone, X, Search } from "lucide-react"

type Friend = {
  id: string
  name: string
  online: boolean
  avatar?: string
}

interface FriendsListProps {
  friends: Friend[]
  onInvite?: (friendId: string) => void
  onCall?: (friendId: string) => void
  onAddToCall?: (friendId: string) => void
  isInCall?: boolean
  isOpen: boolean
  onClose: () => void
  onCallFriend?: (friend: Friend) => void
}

export function FriendsList({
  friends,
  onInvite,
  onCall,
  onAddToCall,
  isInCall,
  isOpen,
  onClose,
  onCallFriend,
}: FriendsListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFriends = friends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    // Load friends from localStorage when component mounts
    const savedFriends = localStorage.getItem("friends")
    if (savedFriends) {
      // This would normally update state, but we're getting friends from props
      // so we don't need to update state here
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-medium">Friends ({friends.length})</h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredFriends.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              {searchQuery ? "No friends match your search" : "You don't have any friends yet"}
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-4">
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
                    {friend.online && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-gray-700 hover:bg-gray-700 text-green-500"
                        onClick={() => (onCallFriend ? onCallFriend(friend) : onCall && onCall(friend.id))}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-gray-700 hover:bg-gray-700"
                      onClick={() => onInvite && onInvite(friend.id)}
                      disabled={!friend.online}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    {isInCall && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-gray-700 hover:bg-gray-700"
                        onClick={() => onAddToCall && onAddToCall(friend.id)}
                        disabled={!friend.online}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
