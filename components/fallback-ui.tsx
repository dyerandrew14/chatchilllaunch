"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { AuthModal } from "@/components/auth-modal"

export function FallbackUI() {
  const [showAuthModal, setShowAuthModal] = React.useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="mb-8 flex items-center justify-center">
        <Image src="/images/logo.png" alt="ChatChill Logo" width={500} height={250} className="w-64 md:w-96" priority />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to ChatChill</h1>
        <p className="text-gray-400 max-w-md mx-auto">Connect with people from around the world through video chat.</p>
      </div>

      <Button
        onClick={() => setShowAuthModal(true)}
        className="bg-yellow-500 text-black hover:bg-yellow-600 px-8 py-2 text-lg font-medium"
      >
        Sign In to Continue
      </Button>

      {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
