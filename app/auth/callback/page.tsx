"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // The route handler will handle the code exchange
    // Just redirect to the home page after a short delay
    const timer = setTimeout(() => {
      router.push("/")
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      <p className="mt-4 text-white">Completing authentication...</p>
    </div>
  )
}
