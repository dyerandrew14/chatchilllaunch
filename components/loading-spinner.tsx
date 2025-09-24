import { Loader2 } from "lucide-react"
import Image from "next/image"

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="mb-8 flex items-center justify-center">
        <Image src="/images/logo.png" alt="ChatChill Logo" width={500} height={250} className="w-64 md:w-96" />
      </div>
      <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      <p className="mt-4 text-white">Loading ChatChill...</p>
    </div>
  )
}
