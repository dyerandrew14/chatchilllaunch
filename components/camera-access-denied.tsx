"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CameraAccessDeniedProps {
  onRetry: () => void
}

export function CameraAccessDenied({ onRetry }: CameraAccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-6 text-center">
      <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Camera Access Required</h2>
      <p className="text-gray-300 mb-6 max-w-md">
        To connect with others, you need to allow camera access. This app is designed for face-to-face conversations.
      </p>
      <div className="space-y-4">
        <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
          Try Again
        </Button>
        <div className="text-sm text-gray-400 max-w-md">
          <p className="mb-2">If you're having trouble:</p>
          <ul className="list-disc list-inside text-left">
            <li>Check your browser settings to ensure camera permissions are enabled</li>
            <li>Make sure no other application is using your camera</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
