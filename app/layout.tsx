import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthDebug } from "@/components/auth-debug"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ChatChill - Video Chat with Random People",
  description: "Connect with random people from around the world through video chat.",
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          <AuthDebug />
        </AuthProvider>
      </body>
    </html>
  )
}
