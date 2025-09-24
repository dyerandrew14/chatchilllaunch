// Types for Spotify API responses
export type SpotifyTrack = {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  preview_url: string
  uri: string
  duration_ms: number
}

export type SpotifyPlaylist = {
  id: string
  name: string
  description: string
  images: { url: string }[]
  tracks: {
    total: number
    items: {
      track: SpotifyTrack
    }[]
  }
}

export type SpotifyArtist = {
  id: string
  name: string
  images: { url: string }[]
  genres: string[]
}

export type SpotifyAlbum = {
  id: string
  name: string
  images: { url: string }[]
  artists: { name: string }[]
  release_date: string
}

// Fetch from Spotify Web API
const fetchSpotifyApi = async (endpoint: string, method = "GET", body?: any) => {
  // Get token from localStorage or wherever you store it after auth
  const token = localStorage.getItem("spotify_token")

  if (!token) {
    throw new Error("No Spotify token found")
  }

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    // Handle token expiration
    if (response.status === 401) {
      localStorage.removeItem("spotify_token")
      throw new Error("Spotify token expired")
    }
    throw new Error(`Spotify API error: ${response.statusText}`)
  }

  return await response.json()
}

// Get user's top tracks
export const getUserTopTracks = async (): Promise<SpotifyTrack[]> => {
  try {
    const data = await fetchSpotifyApi("/me/top/tracks?limit=10")
    return data.items
  } catch (error) {
    console.error("Error fetching top tracks:", error)
    return []
  }
}

// Get user's playlists
export const getUserPlaylists = async (): Promise<SpotifyPlaylist[]> => {
  try {
    const data = await fetchSpotifyApi("/me/playlists?limit=10")
    return data.items
  } catch (error) {
    console.error("Error fetching playlists:", error)
    return []
  }
}

// Get tracks from a playlist
export const getPlaylistTracks = async (playlistId: string): Promise<SpotifyTrack[]> => {
  try {
    const data = await fetchSpotifyApi(`/playlists/${playlistId}/tracks?limit=20`)
    return data.items.map((item: any) => item.track)
  } catch (error) {
    console.error("Error fetching playlist tracks:", error)
    return []
  }
}

// Search Spotify
export const searchSpotify = async (
  query: string,
): Promise<{
  tracks: SpotifyTrack[]
  artists: SpotifyArtist[]
  albums: SpotifyAlbum[]
}> => {
  try {
    if (!query.trim()) {
      return { tracks: [], artists: [], albums: [] }
    }

    const data = await fetchSpotifyApi(`/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=5`)

    return {
      tracks: data.tracks?.items || [],
      artists: data.artists?.items || [],
      albums: data.albums?.items || [],
    }
  } catch (error) {
    console.error("Error searching Spotify:", error)
    return { tracks: [], artists: [], albums: [] }
  }
}

// Get recommendations based on seed tracks or genres
export const getRecommendations = async (
  seedTracks: string[] = [],
  seedGenres: string[] = [],
): Promise<SpotifyTrack[]> => {
  try {
    const params = new URLSearchParams()

    if (seedTracks.length > 0) {
      params.append("seed_tracks", seedTracks.join(","))
    }

    if (seedGenres.length > 0) {
      params.append("seed_genres", seedGenres.join(","))
    }

    // If no seeds provided, use some default genres
    if (seedTracks.length === 0 && seedGenres.length === 0) {
      params.append("seed_genres", "pop,rock,hip-hop,electronic,r-n-b")
    }

    params.append("limit", "10")

    const data = await fetchSpotifyApi(`/recommendations?${params.toString()}`)
    return data.tracks || []
  } catch (error) {
    console.error("Error getting recommendations:", error)
    return []
  }
}

// Create a new playlist
export const createPlaylist = async (name: string, description: string, trackUris: string[]): Promise<string> => {
  try {
    // Get user ID
    const user = await fetchSpotifyApi("/me")

    // Create playlist
    const playlist = await fetchSpotifyApi(`/users/${user.id}/playlists`, "POST", {
      name,
      description,
      public: false,
    })

    // Add tracks to playlist
    if (trackUris.length > 0) {
      await fetchSpotifyApi(`/playlists/${playlist.id}/tracks`, "POST", {
        uris: trackUris,
      })
    }

    return playlist.id
  } catch (error) {
    console.error("Error creating playlist:", error)
    throw error
  }
}

// Spotify authentication URL
export const getSpotifyAuthUrl = () => {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "" // Will be provided by the user
  const redirectUri = encodeURIComponent(window.location.origin + "/spotify-callback")
  const scopes = encodeURIComponent(
    "user-read-private user-read-email playlist-read-private playlist-modify-private user-top-read user-library-read streaming",
  )

  return `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`
}

// Parse access token from URL hash after Spotify auth
export const parseSpotifyToken = (): string | null => {
  if (typeof window === "undefined") return null

  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const token = params.get("access_token")

  if (token) {
    localStorage.setItem("spotify_token", token)
    return token
  }

  return null
}

// Get available genres for recommendations
export const getAvailableGenres = async (): Promise<string[]> => {
  try {
    const data = await fetchSpotifyApi("/recommendations/available-genre-seeds")
    return data.genres || []
  } catch (error) {
    console.error("Error fetching available genres:", error)
    return []
  }
}

// Get recently played tracks
export const getRecentlyPlayed = async (): Promise<SpotifyTrack[]> => {
  try {
    const data = await fetchSpotifyApi("/me/player/recently-played?limit=10")
    return data.items.map((item: any) => item.track)
  } catch (error) {
    console.error("Error fetching recently played tracks:", error)
    return []
  }
}

// Get track details
export const getTrackDetails = async (trackId: string): Promise<SpotifyTrack | null> => {
  try {
    return await fetchSpotifyApi(`/tracks/${trackId}`)
  } catch (error) {
    console.error("Error fetching track details:", error)
    return null
  }
}
