// WebRTC client that works with our simple signaling server

export type WebRTCConfig = {
  iceServers?: RTCIceServer[]
  onRemoteStream?: (stream: MediaStream) => void
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void
  onError?: (error: Error) => void
  onMessage?: (message: any) => void
  onUserJoined?: (userId: string) => void
  onUserLeft?: (userId: string) => void
}

export class WebRTCClient {
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private localStream: MediaStream | null = null
  private socket: WebSocket | null = null
  private userId: string
  private roomId: string | null = null
  private config: WebRTCConfig
  private reconnectInterval: any = null
  private signalingServerUrl: string
  private isRegistered: boolean = false
  private pendingMessages: any[] = []

  constructor(userId: string, signalingServerUrl: string, config: WebRTCConfig = {}) {
    this.userId = userId
    this.signalingServerUrl = signalingServerUrl
    this.config = config
  }

  // Connect to the signaling server
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.signalingServerUrl)

        this.socket.onopen = () => {
          console.log("Connected to signaling server")

          // Wait for WebSocket to be fully ready before sending messages
          setTimeout(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
              // Register with the signaling server
              this.sendToSignalingServer({
                type: "register",
                userId: this.userId,
              })
            } else {
              console.warn("WebSocket not ready, skipping registration")
            }
          }, 500) // Increased delay to ensure connection is stable

          resolve()
        }

        this.socket.onmessage = (event) => {
          this.handleSignalingMessage(event.data)
        }

        this.socket.onclose = () => {
          console.log("Disconnected from signaling server")
          this.attemptReconnect()
        }

        this.socket.onerror = (error) => {
          console.error("WebSocket error details:", error)
          const errorMessage = "WebSocket connection failed"
          if (this.config.onError) {
            this.config.onError(new Error(errorMessage))
          }
          reject(new Error(errorMessage))
        }
      } catch (err) {
        console.error("Failed to connect to signaling server:", err)
        reject(err)
      }
    })
  }

  // Attempt to reconnect to the signaling server
  private attemptReconnect(): void {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
    }

    this.reconnectInterval = setInterval(() => {
      console.log("Attempting to reconnect to signaling server...")
      this.connect()
        .then(() => {
          clearInterval(this.reconnectInterval)
          this.reconnectInterval = null

          // Rejoin room if we were in one
          if (this.roomId) {
            this.joinRoom(this.roomId)
          }
        })
        .catch(() => {
          console.log("Reconnection failed, will retry...")
        })
    }, 5000)
  }

  // Handle messages from the signaling server
  private async handleSignalingMessage(data: string): Promise<void> {
    try {
      const message = JSON.parse(data)

      // Forward message to application if needed
      if (this.config.onMessage) {
        this.config.onMessage(message)
      }

      switch (message.type) {
        case "registered":
          console.log("Registered with signaling server as:", message.userId)
          this.isRegistered = true
          
          // Process any pending messages now that we're registered
          while (this.pendingMessages.length > 0) {
            const pendingMessage = this.pendingMessages.shift()
            this.sendToSignalingServer(pendingMessage)
          }
          break

        case "room-joined":
          console.log("Joined room:", message.roomId)
          console.log("Users in room:", message.users)

          // Only create connections if there are other users (not just yourself)
          if (message.users && message.users.length > 0) {
            // Create peer connections with existing users
            for (const peerId of message.users) {
              // Prevent self-connections
              if (peerId !== this.userId) {
                this.createPeerConnection(peerId)
                
                // Only the user with higher ID creates the offer to avoid conflicts
                if (this.userId > peerId) {
                  console.log("Creating offer (higher ID):", this.userId, "vs", peerId)
                  this.createAndSendOffer(peerId)
                } else {
                  console.log("Waiting for offer (lower ID):", this.userId, "vs", peerId)
                }
              }
            }
          } else {
            console.log("No other users in room, waiting for someone to join...")
          }
          break

        case "user-joined":
          console.log("User joined room:", message.userId)
          
          // Prevent self-connections
          if (message.userId !== this.userId) {
            // Create peer connection with the new user
            this.createPeerConnection(message.userId)
            
            // Only the user with higher ID creates the offer to avoid conflicts
            if (this.userId > message.userId) {
              console.log("Creating offer (higher ID):", this.userId, "vs", message.userId)
              this.createAndSendOffer(message.userId)
            } else {
              console.log("Waiting for offer (lower ID):", this.userId, "vs", message.userId)
            }
            
            if (this.config.onUserJoined) {
              this.config.onUserJoined(message.userId)
            }
          } else {
            console.log("Ignoring self-connection attempt")
          }
          break

        case "user-left":
          console.log("User left room:", message.userId)
          this.closePeerConnection(message.userId)
          
          // If we're in a paired room and our partner left, rejoin waiting room
          if (this.roomId && this.roomId.startsWith("pair_")) {
            console.log("Partner left paired room, rejoining waiting room...")
            this.roomId = null
            this.joinRoom("waiting-room")
          }
          
          if (this.config.onUserLeft) {
            this.config.onUserLeft(message.userId)
          }
          break

        case "paired":
          console.log("Paired with user:", message.partnerId, "in room:", message.roomId)
          
          // Prevent self-connections with multiple checks
          if (message.partnerId !== this.userId && message.partnerId && this.userId) {
            // Update room ID and create connection with partner
            this.roomId = message.roomId
            this.createPeerConnection(message.partnerId)
            
            // Only the user with higher ID creates the offer to avoid conflicts
            if (this.userId > message.partnerId) {
              console.log("Creating offer (higher ID):", this.userId, "vs", message.partnerId)
              this.createAndSendOffer(message.partnerId)
            } else {
              console.log("Waiting for offer (lower ID):", this.userId, "vs", message.partnerId)
            }
            
            if (this.config.onUserJoined) {
              this.config.onUserJoined(message.partnerId)
            }
          } else {
            console.error("🚫 BLOCKED self-pairing attempt:", {
              userId: this.userId,
              partnerId: message.partnerId,
              roomId: message.roomId
            })
            // Don't create any connection for self-pairing
          }
          break

        case "offer":
          console.log("Received offer from:", message.senderId)
          await this.handleOffer(message)
          break

        case "answer":
          console.log("Received answer from:", message.senderId)
          await this.handleAnswer(message)
          break

        case "ice-candidate":
          console.log("Received ICE candidate from:", message.senderId)
          await this.handleIceCandidate(message)
          break

        case "error":
          console.error("Signaling server error:", message.message)
          if (this.config.onError) {
            this.config.onError(new Error(message.message))
          }
          break
      }
    } catch (err) {
      console.error("Error handling signaling message:", err)
    }
  }

  // Send message to signaling server
  private sendToSignalingServer(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Queue non-register messages if we're not registered yet
      if (!this.isRegistered && message.type !== "register") {
        console.log("Queueing message until registered:", message.type)
        this.pendingMessages.push(message)
        return
      }

      try {
        this.socket.send(JSON.stringify(message))
        console.log("Message sent to signaling server:", message.type)
      } catch (error) {
        console.error("Failed to send message to signaling server:", error)
        if (this.config.onError) {
          this.config.onError(new Error(`Failed to send message: ${error}`))
        }
      }
    } else {
      console.warn("Cannot send message: WebSocket state is", this.socket?.readyState)
      // Don't trigger error callback for this - it's expected during connection setup
      if (message.type !== "register") {
        if (this.config.onError) {
          this.config.onError(new Error("Not connected to signaling server"))
        }
      }
    }
  }

  // Join a room
  public joinRoom(roomId: string): void {
    this.roomId = roomId
    
    // Ensure we're connected before joining
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendToSignalingServer({
        type: "join",
        roomId,
      })
    } else {
      console.warn("Cannot join room: WebSocket not ready, state:", this.socket?.readyState)
      // Wait a bit and try again
      setTimeout(() => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.sendToSignalingServer({
            type: "join",
            roomId,
          })
        }
      }, 1000)
    }
  }

  // Leave the current room
  public leaveRoom(): void {
    if (this.roomId) {
      this.sendToSignalingServer({
        type: "leave",
        roomId: this.roomId,
      })

      // Close all peer connections
      for (const peerId of this.peerConnections.keys()) {
        this.closePeerConnection(peerId)
      }

      this.roomId = null
    }
  }

  // Create a peer connection for a specific user
  private createPeerConnection(peerId: string): RTCPeerConnection {
    // Prevent self-connections
    if (peerId === this.userId) {
      console.error("🚫 BLOCKED: Attempted to create peer connection with self:", peerId)
      throw new Error("Cannot create peer connection with self")
    }
    
    if (this.peerConnections.has(peerId)) {
      return this.peerConnections.get(peerId)!
    }

    const iceServers = this.config.iceServers || [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ]

    const pc = new RTCPeerConnection({ iceServers })

    // Add local tracks to the connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!)
      })
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendToSignalingServer({
          type: "ice-candidate",
          candidate: event.candidate,
          targetUserId: peerId,
          roomId: this.roomId,
        })
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`🔗 Connection state with ${peerId}:`, pc.connectionState)
      if (this.config.onConnectionStateChange) {
        this.config.onConnectionStateChange(pc.connectionState)
      }
    }

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${peerId}:`, pc.iceConnectionState)
      if (this.config.onIceConnectionStateChange) {
        this.config.onIceConnectionStateChange(pc.iceConnectionState)
      }
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log("Received remote track from:", peerId)
      if (event.streams && event.streams[0]) {
        if (this.config.onRemoteStream) {
          this.config.onRemoteStream(event.streams[0])
        }
      }
    }

    this.peerConnections.set(peerId, pc)
    return pc
  }

  // Close a peer connection
  private closePeerConnection(peerId: string): void {
    const pc = this.peerConnections.get(peerId)
    if (pc) {
      pc.close()
      this.peerConnections.delete(peerId)
    }
  }

  // Create and send an offer to a peer
  private async createAndSendOffer(peerId: string): Promise<void> {
    try {
      const pc = this.createPeerConnection(peerId)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      this.sendToSignalingServer({
        type: "offer",
        sdp: offer.sdp,
        targetUserId: peerId,
        roomId: this.roomId,
      })
    } catch (err) {
      console.error("Error creating offer:", err)
      if (this.config.onError) {
        this.config.onError(err instanceof Error ? err : new Error("Failed to create offer"))
      }
    }
  }

  // Handle an incoming offer
  private async handleOffer(message: any): Promise<void> {
    try {
      const peerId = message.senderId
      const pc = this.createPeerConnection(peerId)

      // Check if we're in the right state to handle an offer
      if (pc.signalingState !== "stable" && pc.signalingState !== "have-local-offer") {
        console.warn("Cannot handle offer: peer connection in state", pc.signalingState)
        return
      }

      await pc.setRemoteDescription(
        new RTCSessionDescription({
          type: "offer",
          sdp: message.sdp,
        }),
      )

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      this.sendToSignalingServer({
        type: "answer",
        sdp: answer.sdp,
        targetUserId: peerId,
        roomId: this.roomId,
      })
    } catch (err) {
      console.error("Error handling offer:", err)
      if (this.config.onError) {
        this.config.onError(err instanceof Error ? err : new Error("Failed to handle offer"))
      }
    }
  }

  // Handle an incoming answer
  private async handleAnswer(message: any): Promise<void> {
    try {
      const peerId = message.senderId
      const pc = this.peerConnections.get(peerId)

      if (pc) {
        // Check if we're in the right state to handle an answer
        if (pc.signalingState !== "have-local-offer" && pc.signalingState !== "have-remote-pranswer") {
          console.warn("Cannot handle answer: peer connection in state", pc.signalingState)
          return
        }

        await pc.setRemoteDescription(
          new RTCSessionDescription({
            type: "answer",
            sdp: message.sdp,
          }),
        )
      }
    } catch (err) {
      console.error("Error handling answer:", err)
      if (this.config.onError) {
        this.config.onError(err instanceof Error ? err : new Error("Failed to handle answer"))
      }
    }
  }

  // Handle an incoming ICE candidate
  private async handleIceCandidate(message: any): Promise<void> {
    try {
      const peerId = message.senderId
      const pc = this.peerConnections.get(peerId)

      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(message.candidate))
      }
    } catch (err) {
      console.error("Error handling ICE candidate:", err)
      if (this.config.onError) {
        this.config.onError(err instanceof Error ? err : new Error("Failed to handle ICE candidate"))
      }
    }
  }

  // Start local media stream
  public async startLocalStream(
    constraints: MediaStreamConstraints = { video: true, audio: true },
  ): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.localStream = stream

      // Add tracks to all existing peer connections
      for (const [peerId, pc] of this.peerConnections.entries()) {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream)
        })
      }

      return stream
    } catch (err) {
      console.error("Error getting user media:", err)
      if (this.config.onError) {
        this.config.onError(err instanceof Error ? err : new Error("Failed to get user media"))
      }
      throw err
    }
  }

  // Stop local stream
  public stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }
  }

  // Disconnect from signaling server
  public disconnect(): void {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
      this.reconnectInterval = null
    }

    if (this.roomId) {
      this.leaveRoom()
    }

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    // Reset registration state
    this.isRegistered = false
    this.pendingMessages = []

    this.stopLocalStream()
  }

  // Toggle audio mute
  public toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  // Toggle video
  public toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }
}
