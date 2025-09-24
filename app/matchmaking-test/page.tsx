"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function MatchmakingTest() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success?: boolean
    message?: string
    envInfo?: any
    tableInfo?: any
    error?: any
  }>({ message: "Not tested yet" })

  const [matchmakingStatus, setMatchmakingStatus] = useState<{
    status?: string
    message?: string
    roomId?: string
    error?: string
  }>({ message: "Not started" })

  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-matchmaking")
      const data = await response.json()
      setConnectionStatus(data)
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Error testing connection: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const testMatchmaking = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: `test-user-${Date.now()}`,
          hasVideo: true,
        }),
      })

      const data = await response.json()
      setMatchmakingStatus(data)
    } catch (error) {
      setMatchmakingStatus({
        status: "error",
        message: `Error testing matchmaking: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Matchmaking System Test</h1>

      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Supabase Connection Test</h2>
        <Button onClick={testConnection} disabled={loading} className="mb-4">
          {loading ? "Testing..." : "Test Supabase Connection"}
        </Button>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Results:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(connectionStatus, null, 2)}
          </pre>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Matchmaking API Test</h2>
        <Button onClick={testMatchmaking} disabled={loading} className="mb-4">
          {loading ? "Testing..." : "Test Matchmaking API"}
        </Button>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Results:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(matchmakingStatus, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
