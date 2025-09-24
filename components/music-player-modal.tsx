"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipForward, SkipBack, X, Music, Search, Plus } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { SAMPLE_TRACKS } from "@/lib/constants"
import { Input } from "@/components/ui/input"

interface MusicPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  isVip: boolean
  freeSongsRemaining: number
  onVipUpgrade: () => void
  onSpotifyConnected?: () => void
}

export function MusicPlayerModal({
  isOpen,
  onClose,
  isVip,
  freeSongsRemaining,
  onVipUpgrade,
  onSpotifyConnected,
}: MusicPlayerModalProps) {
  const [currentTrack, setCurrentTrack] = useState(SAMPLE_TRACKS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(80)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState(SAMPLE_TRACKS)
  const [activeTab, setActiveTab] = useState<"browse" | "search" | "playlists">("browse")
  const [isConnectingToSpotify, setIsConnectingToSpotify] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Simulate playing music
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext()
            return 0
          }
          return prev + 1
        })
      }, 300) // Faster for demo purposes
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults(SAMPLE_TRACKS)
    } else {
      const filtered = SAMPLE_TRACKS.filter(
        (track) =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(filtered)
    }
  }, [searchQuery])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    const currentIndex = SAMPLE_TRACKS.findIndex((track) => track.id === currentTrack.id)
    const nextIndex = (currentIndex + 1) % SAMPLE_TRACKS.length
    setCurrentTrack(SAMPLE_TRACKS[nextIndex])
    setProgress(0)
  }

  const handlePrev = () => {
    const currentIndex = SAMPLE_TRACKS.findIndex((track) => track.id === currentTrack.id)
    const prevIndex = (currentIndex - 1 + SAMPLE_TRACKS.length) % SAMPLE_TRACKS.length
    setCurrentTrack(SAMPLE_TRACKS[prevIndex])
    setProgress(0)
  }

  const playTrack = (track: any) => {
    if (!isVip && freeSongsRemaining <= 0) {
      onVipUpgrade()
      return
    }

    setCurrentTrack(track)
    setProgress(0)
    setIsPlaying(true)
  }

  const connectToSpotify = () => {
    setIsConnectingToSpotify(true)

    // In a real app, this would redirect to Spotify OAuth
    // For demo purposes, we'll simulate a successful connection
    setTimeout(() => {
      setIsConnected(true)
      setIsConnectingToSpotify(false)

      // Add a success message to show the user it worked
      if (onSpotifyConnected) {
        onSpotifyConnected()
      }
    }, 1500)
  }

  const handleConnectSpotify = () => {
    // In a real app, this would redirect to Spotify OAuth
    // For now, we'll simulate a successful connection
    setTimeout(() => {
      setIsConnected(true)
      setIsConnectingToSpotify(false)
      if (onSpotifyConnected) {
        onSpotifyConnected()
      }
    }, 1500)
  }

  if (!isOpen) return null

  if (!isConnected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-medium flex items-center">
              <Music className="mr-2 h-5 w-5 text-green-500" />
              Connect to Spotify
            </h2>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-6 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="64" height="64" className="text-green-500">
                  <path
                    fill="currentColor"
                    d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Connect to Spotify</h3>
              <p className="text-gray-400 text-center mb-6">
                Connect your Spotify account to play music during your video chats.
              </p>

              {!isVip && (
                <div className="bg-gray-800 p-3 rounded-md mb-6 text-center">
                  <p className="text-sm text-gray-300 mb-1">Free users: {freeSongsRemaining} plays remaining today</p>
                  <p className="text-xs text-gray-400">VIP members get unlimited music</p>
                </div>
              )}

              <Button
                className="w-full bg-green-500 hover:bg-green-600 mb-4"
                onClick={handleConnectSpotify}
                disabled={isConnectingToSpotify}
              >
                {isConnectingToSpotify ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>Connect with Spotify</>
                )}
              </Button>

              <Button variant="outline" className="w-full" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-medium flex items-center">
            <Music className="mr-2 h-5 w-5 text-green-500" />
            Spotify
            {!isVip && (
              <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">
                {freeSongsRemaining} free plays left
              </span>
            )}
          </h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="flex flex-col items-center mb-6">
            <img
              src={currentTrack.albumArt || "/placeholder.svg?height=192&width=192&query=album+cover"}
              alt={currentTrack.title}
              className="w-48 h-48 object-cover rounded-lg shadow-lg mb-4"
            />
            <h3 className="text-lg font-medium">{currentTrack.title}</h3>
            <p className="text-gray-400">{currentTrack.artist}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">{formatTime(progress * 30)}</span>
              <span className="text-xs text-gray-400">{formatTime(30 * 100)}</span>
            </div>
            <Slider
              value={[progress]}
              max={100}
              step={1}
              onValueChange={(value) => setProgress(value[0])}
              className="h-1"
            />
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={handlePrev}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={handleNext}>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Volume</span>
              <span className="text-xs text-gray-400">{volume}%</span>
            </div>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0])}
              className="h-1"
            />
          </div>

          <div className="mt-6 border-t border-gray-700 pt-4">
            <div className="flex border-b border-gray-700 mb-4">
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === "browse" ? "text-white border-b-2 border-green-500" : "text-gray-400"}`}
                onClick={() => setActiveTab("browse")}
              >
                Browse
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === "search" ? "text-white border-b-2 border-green-500" : "text-gray-400"}`}
                onClick={() => setActiveTab("search")}
              >
                Search
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === "playlists" ? "text-white border-b-2 border-green-500" : "text-gray-400"}`}
                onClick={() => setActiveTab("playlists")}
              >
                Playlists
              </button>
            </div>

            {activeTab === "search" && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search for songs, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            )}

            {activeTab === "playlists" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer">
                  <div className="h-12 w-12 bg-gray-700 rounded-md flex items-center justify-center">
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">Create New Playlist</p>
                    <p className="text-sm text-gray-400">Start from scratch</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer">
                  <img src="/playlist-cover.png" alt="Playlist" className="h-12 w-12 rounded-md object-cover" />
                  <div>
                    <p className="font-medium">My Favorites</p>
                    <p className="text-sm text-gray-400">24 songs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer">
                  <img src="/chill-playlist.png" alt="Playlist" className="h-12 w-12 rounded-md object-cover" />
                  <div>
                    <p className="font-medium">Chill Vibes</p>
                    <p className="text-sm text-gray-400">18 songs</p>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === "browse" || activeTab === "search") && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-2">
                  {activeTab === "search" ? "Search Results" : "Popular Tracks"}
                </h3>
                <div className="space-y-2">
                  {searchResults.slice(0, 5).map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer"
                      onClick={() => playTrack(track)}
                    >
                      <img
                        src={track.albumArt || "/placeholder.svg?height=40&width=40&query=album+cover"}
                        alt={track.title}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
