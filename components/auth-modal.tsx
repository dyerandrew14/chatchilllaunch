"use client"

import { useState, useEffect } from "react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { X, Loader2 } from "lucide-react"
import Image from "next/image"

interface AuthModalProps {
  isOpen: boolean
  onClose?: () => void
  initialError?: string | null
}

export function AuthModal({ isOpen, onClose, initialError }: AuthModalProps) {
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_in")
  const [error, setError] = useState<string | null>(initialError || null)
  const [isLoading, setIsLoading] = useState(false)
  const [authComplete, setAuthComplete] = useState(false)
  const supabase = createClientComponentClient()

  // Reset error when props change
  useEffect(() => {
    setError(initialError || null)
  }, [initialError])

  // Check for session changes to auto-close the modal
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in modal:", event)

      if (event === "SIGNED_IN") {
        setIsLoading(true)
        setAuthComplete(true)

        // Add a delay to allow the profile to be created
        setTimeout(() => {
          setIsLoading(false)
          if (onClose) {
            onClose()
          }
          // Reload the page to ensure all auth state is properly updated
          window.location.reload()
        }, 2000)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-gray-900 p-6 shadow-xl">
        {onClose && !isLoading && !authComplete && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="mb-6 flex justify-center">
          <Image src="/images/logo.png" alt="ChatChill Logo" width={200} height={80} className="h-24 w-auto" />
        </div>

        {isLoading || authComplete ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mb-4" />
            <p className="text-center text-gray-300">{authComplete ? "Setting up your account..." : "Processing..."}</p>
            <p className="text-center text-gray-500 text-sm mt-2">This will only take a moment</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-md bg-red-900/50 p-3 text-red-200">
                <p>{error}</p>
              </div>
            )}

            <div className="mb-4 flex justify-center space-x-4">
              <button
                className={`px-4 py-2 ${view === "sign_in" ? "border-b-2 border-yellow-500 font-medium text-white" : "text-gray-400"}`}
                onClick={() => setView("sign_in")}
              >
                Sign In
              </button>
              <button
                className={`px-4 py-2 ${view === "sign_up" ? "border-b-2 border-yellow-500 font-medium text-white" : "text-gray-400"}`}
                onClick={() => setView("sign_up")}
              >
                Sign Up
              </button>
            </div>

            <Auth
              supabaseClient={supabase}
              view={view}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#eab308",
                      brandAccent: "#ca8a04",
                      inputBackground: "#374151",
                      inputText: "white",
                      inputPlaceholder: "#9ca3af",
                      inputBorder: "#4b5563",
                      inputBorderFocus: "#eab308",
                      inputBorderHover: "#6b7280",
                    },
                  },
                },
                className: {
                  container: "auth-container",
                  label: "text-white text-sm font-medium mb-1",
                  button: "bg-yellow-500 hover:bg-yellow-600 text-black font-medium",
                  input: "bg-gray-700 border-gray-600 text-white",
                  divider: "bg-gray-700 text-gray-400",
                  message: "text-gray-400",
                  anchor: "text-yellow-500 hover:text-yellow-400",
                },
              }}
              providers={["google", "discord"]}
              redirectTo={`${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`}
            />
          </>
        )}
      </div>
    </div>
  )
}
