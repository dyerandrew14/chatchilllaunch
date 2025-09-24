// Types for signaling messages
export type SignalingMessage =
  | {
      type: "offer" | "answer"
      sdp: string
      roomId: string
      senderId: string
    }
  | {
      type: "ice-candidate"
      candidate: RTCIceCandidateInit
      roomId: string
      senderId: string
    }
  | {
      type: "join"
      roomId: string
      senderId: string
    }
  | {
      type: "leave"
      roomId: string
      senderId: string
    }

// Signaling service class
export class SignalingService {
  private socket: WebSocket | null = null
  private messageCallbacks: ((message: SignalingMessage) => void)[] = []
  private connectionStateCallbacks: ((state: "connecting" | "connected" | "disconnected") => void)[] = []
  private reconnectTimeout: NodeJS.Timeout | null = null
  private userId: string
  private serverUrl: string

  constructor(serverUrl: string, userId: string) {
    this.serverUrl = serverUrl
    this.userId = userId
  }

  // Connect to the signaling server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.notifyConnectionState("connecting")

        if (
          typeof window !== "undefined" &&
          window.location.protocol === "https:" &&
          !this.serverUrl.startsWith("wss:")
        ) {
          this.serverUrl = this.serverUrl.replace("ws:", "wss:")
        }

        const serverUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || "wss://your-signaling-server.onrender.com"
        this.socket = new WebSocket(serverUrl)

        this.socket.onopen = () => {
          console.log("Connected to signaling server")
          this.notifyConnectionState("connected")
          resolve()
        }

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as SignalingMessage
            this.notifyMessage(message)
          } catch (err) {
            console.error("Failed to parse signaling message:", err)
          }
        }

        this.socket.onclose = () => {
          console.log("Disconnected from signaling server")
          this.notifyConnectionState("disconnected")
          this.reconnect()
        }

        this.socket.onerror = (error) => {
          console.error("Signaling server error:", error)
          reject(error)
        }
      } catch (err) {
        console.error("Failed to connect to signaling server:", err)
        this.notifyConnectionState("disconnected")
        this.reconnect()
        reject(err)
      }
    })
  }

  // Reconnect to the signaling server
  private reconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log("Attempting to reconnect to signaling server...")
      this.connect().catch(() => {
        // If reconnection fails, try again
        this.reconnect()
      })
    }, 5000) // Try to reconnect after 5 seconds
  }

  // Send a message to the signaling server
  send(message: Omit<SignalingMessage, "senderId">): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("Cannot send message: not connected to signaling server")
      return
    }

    const fullMessage = {
      ...message,
      senderId: this.userId,
    }

    this.socket.send(JSON.stringify(fullMessage))
  }

  // Join a room
  joinRoom(roomId: string): void {
    this.send({
      type: "join",
      roomId,
    })
  }

  // Leave a room
  leaveRoom(roomId: string): void {
    this.send({
      type: "leave",
      roomId,
    })
  }

  // Send an offer
  sendOffer(roomId: string, offer: RTCSessionDescriptionInit): void {
    this.send({
      type: "offer",
      sdp: offer.sdp || "",
      roomId,
    })
  }

  // Send an answer
  sendAnswer(roomId: string, answer: RTCSessionDescriptionInit): void {
    this.send({
      type: "answer",
      sdp: answer.sdp || "",
      roomId,
    })
  }

  // Send an ICE candidate
  sendIceCandidate(roomId: string, candidate: RTCIceCandidateInit): void {
    this.send({
      type: "ice-candidate",
      candidate,
      roomId,
    })
  }

  // Register a callback for incoming messages
  onMessage(callback: (message: SignalingMessage) => void): () => void {
    this.messageCallbacks.push(callback)

    // Return a function to unregister the callback
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback)
    }
  }

  // Register a callback for connection state changes
  onConnectionState(callback: (state: "connecting" | "connected" | "disconnected") => void): () => void {
    this.connectionStateCallbacks.push(callback)

    // Return a function to unregister the callback
    return () => {
      this.connectionStateCallbacks = this.connectionStateCallbacks.filter((cb) => cb !== callback)
    }
  }

  // Notify all message callbacks
  private notifyMessage(message: SignalingMessage): void {
    this.messageCallbacks.forEach((callback) => callback(message))
  }

  // Notify all connection state callbacks
  private notifyConnectionState(state: "connecting" | "connected" | "disconnected"): void {
    this.connectionStateCallbacks.forEach((callback) => callback(state))
  }

  // Disconnect from the signaling server
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

// Create a singleton instance
let signalingService: SignalingService | null = null

// Get or create the signaling service
export function getSignalingService(serverUrl: string, userId: string): SignalingService {
  if (!signalingService) {
    signalingService = new SignalingService(serverUrl, userId)
  }
  return signalingService
}
