"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { X } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (userData: any) => void
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [activeProvider, setActiveProvider] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form state
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)

  if (!isOpen) return null

  const handleProviderLogin = async (provider: string) => {
    setIsLoading(true)
    setActiveProvider(provider)

    // Simulate API call
    setTimeout(() => {
      // Save user data
      const userData = {
        username: provider === "discord" ? "DiscordUser" : provider === "google" ? "GoogleUser" : "SteamUser",
        email: `${provider}@example.com`,
        isLoggedIn: true,
      }

      onLogin(userData)
      setIsLoading(false)
      onClose()
    }, 1500)
  }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const userData = {
        username: loginEmail.split("@")[0],
        email: loginEmail,
        isLoggedIn: true,
      }

      onLogin(userData)
      setIsLoading(false)
      onClose()
    }, 1500)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const userData = {
        username: username,
        email: email,
        isLoggedIn: true,
        profileImage: profileImagePreview,
      }

      onLogin(userData)
      setIsLoading(false)
      onClose()
    }, 1500)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-800 bg-gray-900 text-white relative">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 rounded-full" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center pb-2">
          <Image
            src="/images/logo.png"
            alt="ChatChill Logo"
            width={200}
            height={80}
            className="h-16 w-auto mx-auto mb-4"
          />
          <CardTitle className="text-2xl">Welcome to ChatChill</CardTitle>
          <CardDescription className="text-gray-400">Connect with people around the world</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative bg-gray-900 px-4 text-sm text-gray-400">or continue with</div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-3 bg-[#5865F2] text-white hover:bg-[#4752C4] border-none h-10"
                  onClick={() => handleProviderLogin("discord")}
                  disabled={isLoading}
                >
                  {isLoading && activeProvider === "discord" ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.952,5.672c-1.904-1.531-4.916-1.79-5.044-1.801c-0.201-0.017-0.392,0.097-0.474,0.281 c-0.006,0.012-0.072,0.163-0.145,0.398c1.259,0.212,2.806,0.64,4.206,1.509c0.224,0.139,0.293,0.434,0.154,0.659 c-0.09,0.146-0.247,0.226-0.407,0.226c-0.086,0-0.173-0.023-0.252-0.072C15.584,5.38,12.578,5.305,12,5.305S8.415,5.38,6.011,6.872 c-0.225,0.14-0.519,0.07-0.659-0.154c-0.14-0.225-0.07-0.519,0.154-0.659c1.4-0.868,2.947-1.297,4.206-1.509 c-0.074-0.236-0.14-0.386-0.145-0.398C9.484,3.968,9.294,3.852,9.092,3.872c-0.127,0.01-3.139,0.269-5.069,1.822 C3.015,6.625,1,12.073,1,16.783c0,0.083,0.022,0.165,0.063,0.237c1.391,2.443,5.185,3.083,6.05,3.111c0.005,0,0.01,0,0.015,0 c0.153,0,0.297-0.073,0.387-0.197l0.875-1.202c-2.359-0.61-3.564-1.645-3.634-1.706c-0.198-0.175-0.217-0.477-0.042-0.675 c0.175-0.198,0.476-0.217,0.674-0.043c0.029,0.026,2.248,1.909,6.612,1.909c4.372,0,6.591-1.891,6.613-1.91 c0.198-0.172,0.5-0.154,0.674,0.045c0.174,0.198,0.155,0.499-0.042,0.673c-0.07,0.062-1.275,1.096-3.634,1.706l0.875,1.202 c0.09,0.124,0.234,0.197,0.387,0.197c0.005,0,0.01,0,0.015,0c0.865-0.027,4.659-0.667,6.05-3.111 C22.978,16.947,23,16.866,23,16.783C23,12.073,20.985,6.625,19.952,5.672z M8.891,14.87c-0.924,0-1.674-0.857-1.674-1.913 s0.749-1.913,1.674-1.913s1.674,0.857,1.674,1.913S9.816,14.87,8.891,14.87z M15.109,14.87c-0.924,0-1.674-0.857-1.674-1.913 s0.749-1.913,1.674-1.913c0.924,0,1.674,0.857,1.674,1.913S16.033,14.87,15.109,14.87z" />
                    </svg>
                  )}
                  Discord
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 border-none h-10"
                  onClick={() => handleProviderLogin("google")}
                  disabled={isLoading}
                >
                  {isLoading && activeProvider === "google" ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Google
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="cooluser123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-image">Profile Image (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview || "/placeholder.svg"}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-2xl">?</span>
                      )}
                    </div>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
                  disabled={isLoading || password !== confirmPassword}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                {password !== confirmPassword && password && confirmPassword && (
                  <p className="text-red-500 text-sm">Passwords do not match</p>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter>
          <p className="text-center text-xs text-gray-400 w-full">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
