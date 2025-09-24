import {
  Room,
  type RoomOptions,
  type ConnectionState,
  RoomEvent,
  type LocalParticipant,
  type RemoteParticipant,
} from "livekit-client"

// Default LiveKit URL
const DEFAULT_LIVEKIT_URL = "wss://chatchill-9vbxm2k6.livekit.cloud"

// Get the LiveKit URL from environment variables or use the default
export const getLiveKitUrl = (): string => {
  return process.env.NEXT_PUBLIC_LIVEKIT_URL || DEFAULT_LIVEKIT_URL
}

// Default room options
const defaultRoomOptions: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  publishDefaults: {
    simulcast: true,
    videoSimulcastLayers: [
      { width: 320, height: 180, encoding: { maxBitrate: 150_000, maxFramerate: 15 } },
      { width: 640, height: 360, encoding: { maxBitrate: 500_000, maxFramerate: 30 } },
      { width: 1280, height: 720, encoding: { maxBitrate: 1_500_000, maxFramerate: 30 } },
    ],
  },
}

// Create a new LiveKit room
export const createRoom = (options?: Partial<RoomOptions>): Room => {
  return new Room({
    ...defaultRoomOptions,
    ...options,
  })
}

// Connect to a LiveKit room
export const connectToRoom = async (room: Room, token: string, url?: string): Promise<Room> => {
  await room.connect(url || getLiveKitUrl(), token)
  return room
}

// Publish local tracks
export const publishLocalTracks = async (
  participant: LocalParticipant,
  options?: { audio?: boolean; video?: boolean },
): Promise<void> => {
  const { audio = true, video = true } = options || {}

  try {
    const tracks = await participant.createCameraAndMicrophoneTracks()

    for (const track of tracks) {
      if ((track.kind === "audio" && audio) || (track.kind === "video" && video)) {
        await participant.publishTrack(track)
      }
    }
  } catch (error) {
    console.error("Error publishing local tracks:", error)
    throw error
  }
}

// Disconnect from a room and clean up
export const disconnectFromRoom = (room: Room): void => {
  if (room) {
    room.disconnect()
  }
}

// Add event listeners to a room
export const setupRoomEventListeners = (
  room: Room,
  callbacks: {
    onConnected?: () => void
    onDisconnected?: () => void
    onParticipantConnected?: (participant: RemoteParticipant) => void
    onParticipantDisconnected?: (participant: RemoteParticipant) => void
    onConnectionStateChanged?: (state: ConnectionState) => void
  },
): void => {
  if (callbacks.onConnected) {
    room.once(RoomEvent.Connected, callbacks.onConnected)
  }

  if (callbacks.onDisconnected) {
    room.on(RoomEvent.Disconnected, callbacks.onDisconnected)
  }

  if (callbacks.onParticipantConnected) {
    room.on(RoomEvent.ParticipantConnected, callbacks.onParticipantConnected)
  }

  if (callbacks.onParticipantDisconnected) {
    room.on(RoomEvent.ParticipantDisconnected, callbacks.onParticipantDisconnected)
  }

  if (callbacks.onConnectionStateChanged) {
    room.on(RoomEvent.ConnectionStateChanged, callbacks.onConnectionStateChanged)
  }
}
