// Simple WebSocket signaling server for WebRTC
// You can run this with Node.js: node signaling-server.js

const WebSocket = require("ws")
const http = require("http")

const PORT = process.env.PORT || 8080

// Create HTTP server for health checks (keeps Render awake)
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ 
      status: 'ok', 
      clients: clients.size, 
      rooms: rooms.size,
      timestamp: new Date().toISOString()
    }))
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('WebRTC Signaling Server')
  }
})

const wss = new WebSocket.Server({ server })

// Store active connections
const clients = new Map() // userId -> { ws, currentRoom }
const rooms = new Map() // roomId -> Set of userIds
const userCooldowns = new Map() // userId -> timestamp when they can join waiting room again

// Start the server
server.listen(PORT, () => {
  console.log(`WebSocket signaling server running on port ${PORT}`)
  console.log(`Health check available at http://localhost:${PORT}/health`)
})

// Keep server awake with periodic health checks and cleanup
setInterval(() => {
  console.log(`Server status: ${clients.size} clients, ${rooms.size} rooms`)
  
  // Clean up expired cooldowns
  const now = Date.now()
  for (const [userId, cooldownEnd] of userCooldowns.entries()) {
    if (now >= cooldownEnd) {
      userCooldowns.delete(userId)
    }
  }
}, 30000) // Log every 30 seconds

wss.on("connection", (ws) => {
  console.log("Client connected")
  let userId = null

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message)

      // Handle user identification
      if (data.type === "register") {
        userId = data.userId
        clients.set(userId, { ws, currentRoom: null })
        console.log(`User registered: ${userId}`)
        ws.send(JSON.stringify({ type: "registered", userId }))
        return
      }

      // Ensure user is registered
      if (!userId) {
        ws.send(JSON.stringify({ type: "error", message: "Not registered" }))
        return
      }

      // Handle room operations
      if (data.type === "join") {
        const roomId = data.roomId
        const clientData = clients.get(userId)
        const currentRoom = clientData ? clientData.currentRoom : null

        // Leave current room if any
        if (currentRoom) {
          const room = rooms.get(currentRoom)
          if (room) {
            room.delete(userId)
            if (room.size === 0) {
              rooms.delete(currentRoom)
            } else {
              // Notify others that user left
              broadcastToRoom(
                currentRoom,
                {
                  type: "user-left",
                  userId,
                  roomId: currentRoom,
                },
                userId,
              )
            }
          }
          // Clear current room from client data
          clients.set(userId, { ws, currentRoom: null })
        }

        // Join new room
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set())
        }

        const room = rooms.get(roomId)
        
        // Special handling for waiting room - implement pairing
        if (roomId === "waiting-room") {
          console.log(`User ${userId} joining waiting room. Current users in room:`, Array.from(room))
          
          // Check if user is in cooldown period (just left a room)
          const cooldownEnd = userCooldowns.get(userId)
          const now = Date.now()
          
          if (cooldownEnd && now < cooldownEnd) {
            // User is in cooldown, just add them to waiting room without pairing
            room.add(userId)
            clients.set(userId, { ws, currentRoom: roomId })
            ws.send(JSON.stringify({
              type: "room-joined",
              roomId,
              users: [],
            }))
            console.log(`User ${userId} in cooldown until ${new Date(cooldownEnd)}`)
            return
          }
          
          // Remove cooldown if it exists
          userCooldowns.delete(userId)
          
          // Get users already in waiting room (excluding current user)
          const usersInWaitingRoom = Array.from(room).filter((id) => id !== userId)
          console.log(`Users in waiting room (excluding ${userId}):`, usersInWaitingRoom)
          
          // If there's another user waiting, pair them up
          if (usersInWaitingRoom.length >= 1) {
            const partnerId = usersInWaitingRoom[0] // Get the first waiting user
            console.log(`Attempting to pair ${userId} with ${partnerId}`)
            
            // Verify partner is still available and not already paired
            const partnerData = clients.get(partnerId)
            if (!partnerData || partnerData.currentRoom !== roomId) {
              // Partner is no longer available, just add to waiting room
              room.add(userId)
              clients.set(userId, { ws, currentRoom: roomId })
              ws.send(JSON.stringify({
                type: "room-joined",
                roomId,
                users: [],
              }))
              console.log(`Partner ${partnerId} no longer available, ${userId} added to waiting room`)
              return
            }
            
            // Double-check that we're not trying to pair with ourselves
            if (partnerId === userId) {
              console.error(`ERROR: Attempting to pair ${userId} with themselves!`)
              room.add(userId)
              clients.set(userId, { ws, currentRoom: roomId })
              ws.send(JSON.stringify({
                type: "room-joined",
                roomId,
                users: [],
              }))
              return
            }
            
            // Create a unique room for the pair
            const pairRoomId = `pair_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
            
            // Remove both users from waiting room
            room.delete(userId)
            room.delete(partnerId)
            
            // Create new pair room
            rooms.set(pairRoomId, new Set([userId, partnerId]))
            
            // Update both users' current room
            clients.set(userId, { ws, currentRoom: pairRoomId })
            clients.set(partnerId, { ...partnerData, currentRoom: pairRoomId })
            
            // Send pair notification to both users
            ws.send(JSON.stringify({
              type: "paired",
              roomId: pairRoomId,
              partnerId: partnerId,
            }))
            
            partnerData.ws.send(JSON.stringify({
              type: "paired", 
              roomId: pairRoomId,
              partnerId: userId,
            }))
            
            console.log(`✅ Successfully paired users ${userId} and ${partnerId} in room ${pairRoomId}`)
          } else {
            // No one else waiting, stay in waiting room
            room.add(userId)
            clients.set(userId, { ws, currentRoom: roomId })
            ws.send(JSON.stringify({
              type: "room-joined",
              roomId,
              users: [],
            }))
            console.log(`User ${userId} added to waiting room, no partners available`)
          }
        } else {
          // Regular room handling
          room.add(userId)
          clients.set(userId, { ws, currentRoom: roomId })
          const usersInRoom = Array.from(room).filter((id) => id !== userId)
          
          ws.send(JSON.stringify({
            type: "room-joined",
            roomId,
            users: usersInRoom,
          }))

          // Notify others in room
          broadcastToRoom(
            roomId,
            {
              type: "user-joined",
              userId,
              roomId,
            },
            userId,
          )
        }

        console.log(`User ${userId} joined room ${roomId}`)
        return
      }

      if (data.type === "leave") {
        const roomId = data.roomId
        const clientData = clients.get(userId)
        const currentRoom = clientData ? clientData.currentRoom : null
        
        if (roomId === currentRoom && rooms.has(roomId)) {
          const room = rooms.get(roomId)
          room.delete(userId)

          // If leaving a paired room, add cooldown to prevent immediate re-pairing
          if (roomId.startsWith("pair_")) {
            const cooldownDuration = 3000 // 3 seconds cooldown
            userCooldowns.set(userId, Date.now() + cooldownDuration)
            console.log(`User ${userId} left paired room ${roomId}, cooldown until ${new Date(Date.now() + cooldownDuration)}`)
          }

          if (room.size === 0) {
            rooms.delete(roomId)
          } else {
            // Notify others that user left
            broadcastToRoom(
              roomId,
              {
                type: "user-left",
                userId,
                roomId,
              },
              userId,
            )
          }

          // Clear current room from client data
          clients.set(userId, { ws, currentRoom: null })
          console.log(`User ${userId} left room ${roomId}`)
        }
        return
      }

      // Handle WebRTC signaling messages
      if (["offer", "answer", "ice-candidate"].includes(data.type)) {
        const { targetUserId, roomId } = data

        if (!targetUserId || !roomId) {
          ws.send(JSON.stringify({ type: "error", message: "Missing targetUserId or roomId" }))
          return
        }

        // Check if target user exists and is in the same room
        const targetClientData = clients.get(targetUserId)
        const room = rooms.get(roomId)

        if (targetClientData && room && room.has(targetUserId)) {
          // Forward the message to the target user
          const forwardMessage = {
            ...data,
            senderId: userId,
          }

          targetClientData.ws.send(JSON.stringify(forwardMessage))
          console.log(`Forwarded ${data.type} from ${userId} to ${targetUserId}`)
        } else {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `User ${targetUserId} not found or not in room ${roomId}`,
            }),
          )
        }
        return
      }

      // Broadcast to room (for chat messages, etc.)
      if (data.type === "broadcast" && data.roomId) {
        broadcastToRoom(
          data.roomId,
          {
            ...data,
            senderId: userId,
          },
          null,
        ) // Include sender in broadcast
        return
      }
    } catch (error) {
      console.error("Error processing message:", error)
      ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }))
    }
  })

  ws.on("close", () => {
    console.log(`Client disconnected: ${userId}`)

    // Remove from current room
    const clientData = clients.get(userId)
    const currentRoom = clientData ? clientData.currentRoom : null
    
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom)
      room.delete(userId)

      if (room.size === 0) {
        rooms.delete(currentRoom)
      } else {
        // Notify others that user left
        broadcastToRoom(
          currentRoom,
          {
            type: "user-left",
            userId,
            roomId: currentRoom,
          },
          userId,
        )
      }
    }

    // Remove from clients list and cooldowns
    if (userId) {
      clients.delete(userId)
      userCooldowns.delete(userId) // Clean up cooldown if user disconnects
    }
  })

  // Helper function to broadcast to all users in a room
  function broadcastToRoom(roomId, message, excludeUserId) {
    if (!rooms.has(roomId)) return

    const room = rooms.get(roomId)
    room.forEach((id) => {
      if (excludeUserId && id === excludeUserId) return

      const clientData = clients.get(id)
      if (clientData && clientData.ws && clientData.ws.readyState === WebSocket.OPEN) {
        clientData.ws.send(JSON.stringify(message))
      }
    })
  }
})
