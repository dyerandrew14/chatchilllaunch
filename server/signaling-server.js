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
const clients = new Map()
const rooms = new Map()

// Start the server
server.listen(PORT, () => {
  console.log(`WebSocket signaling server running on port ${PORT}`)
  console.log(`Health check available at http://localhost:${PORT}/health`)
})

// Keep server awake with periodic health checks
setInterval(() => {
  console.log(`Server status: ${clients.size} clients, ${rooms.size} rooms`)
}, 30000) // Log every 30 seconds

wss.on("connection", (ws) => {
  console.log("Client connected")
  let userId = null
  let currentRoom = null

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message)

      // Handle user identification
      if (data.type === "register") {
        userId = data.userId
        clients.set(userId, ws)
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
        }

        // Join new room
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set())
        }

        const room = rooms.get(roomId)
        room.add(userId)
        currentRoom = roomId

        // Special handling for waiting room - implement pairing
        if (roomId === "waiting-room") {
          const usersInWaitingRoom = Array.from(room).filter((id) => id !== userId)
          
          // If there's another user waiting, pair them up
          if (usersInWaitingRoom.length >= 1) {
            const partnerId = usersInWaitingRoom[0] // Get the first waiting user
            
            // Create a unique room for the pair
            const pairRoomId = `pair_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
            
            // Remove both users from waiting room
            room.delete(userId)
            room.delete(partnerId)
            
            // Create new pair room
            rooms.set(pairRoomId, new Set([userId, partnerId]))
            
            // Get WebSocket connections for both users
            const partnerWs = clients.get(partnerId)
            
            // Send pair notification to both users
            ws.send(JSON.stringify({
              type: "paired",
              roomId: pairRoomId,
              partnerId: partnerId,
            }))
            
            if (partnerWs) {
              partnerWs.send(JSON.stringify({
                type: "paired", 
                roomId: pairRoomId,
                partnerId: userId,
              }))
            }
            
            console.log(`Paired users ${userId} and ${partnerId} in room ${pairRoomId}`)
          } else {
            // No one else waiting, stay in waiting room
            ws.send(JSON.stringify({
              type: "room-joined",
              roomId,
              users: [],
            }))
          }
        } else {
          // Regular room handling
          const usersInRoom = Array.from(room).filter((id) => id !== userId)
          ws.send(
            JSON.stringify({
              type: "room-joined",
              roomId,
              users: usersInRoom,
            }),
          )

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
        if (roomId === currentRoom && rooms.has(roomId)) {
          const room = rooms.get(roomId)
          room.delete(userId)

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

          currentRoom = null
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
        const targetWs = clients.get(targetUserId)
        const room = rooms.get(roomId)

        if (targetWs && room && room.has(targetUserId)) {
          // Forward the message to the target user
          const forwardMessage = {
            ...data,
            senderId: userId,
          }

          targetWs.send(JSON.stringify(forwardMessage))
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

    // Remove from clients list
    if (userId) {
      clients.delete(userId)
    }
  })

  // Helper function to broadcast to all users in a room
  function broadcastToRoom(roomId, message, excludeUserId) {
    if (!rooms.has(roomId)) return

    const room = rooms.get(roomId)
    room.forEach((id) => {
      if (excludeUserId && id === excludeUserId) return

      const clientWs = clients.get(id)
      if (clientWs && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(message))
      }
    })
  }
})
