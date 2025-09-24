"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TokenTest() {
  const [tokenData, setTokenData] = useState<any>(null)
  const [testData, setTestData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testTokenApi = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/token?room=test-room")

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setTokenData(data)
    } catch (err) {
      console.error("Error testing token API:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const testEnvVariables = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-token")

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setTestData(data)
    } catch (err) {
      console.error("Error testing environment variables:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-2xl font-bold">Token API Test</h1>

      <div className="flex gap-4 mb-6">
        <Button onClick={testTokenApi} disabled={loading} className="mb-4">
          {loading ? "Testing..." : "Test Token API"}
        </Button>

        <Button onClick={testEnvVariables} disabled={loading} className="mb-4">
          {loading ? "Testing..." : "Test Environment Variables"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {tokenData && (
        <div className="rounded-md bg-gray-100 p-4 mb-6">
          <p className="mb-2 font-bold">Token API Response:</p>
          <pre className="overflow-auto rounded-md bg-gray-800 p-4 text-sm text-white">
            {JSON.stringify(tokenData, null, 2)}
          </pre>
        </div>
      )}

      {testData && (
        <div className="rounded-md bg-gray-100 p-4">
          <p className="mb-2 font-bold">Environment Variables Test:</p>
          <pre className="overflow-auto rounded-md bg-gray-800 p-4 text-sm text-white">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
