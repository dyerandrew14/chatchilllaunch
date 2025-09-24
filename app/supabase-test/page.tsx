"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-supabase")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>

      <Button onClick={testConnection} disabled={loading} className="mb-4">
        {loading ? "Testing..." : "Test Supabase Connection"}
      </Button>

      {testResult && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Test Results:</h2>
          <div className="p-4 rounded-lg bg-gray-50 border">
            <div className="mb-2">
              <span className="font-medium">Status: </span>
              <span className={testResult.success ? "text-green-600" : "text-red-600"}>
                {testResult.success ? "Success ✓" : "Failed ✗"}
              </span>
            </div>

            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
