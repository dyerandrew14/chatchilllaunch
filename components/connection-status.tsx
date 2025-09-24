import { ConnectionState } from "livekit-client"
import { Wifi, WifiOff, AlertTriangle } from "lucide-react"

type ConnectionStatusProps = {
  connectionState: ConnectionState
  className?: string
}

export function ConnectionStatus({ connectionState, className }: ConnectionStatusProps) {
  // Determine the appropriate icon and color based on connection state
  let icon = <Wifi className="h-4 w-4" />
  let color = "bg-green-500"
  let text = "Connected"

  switch (connectionState) {
    case ConnectionState.Connecting:
      icon = <Wifi className="h-4 w-4 animate-pulse" />
      color = "bg-yellow-500"
      text = "Connecting"
      break
    case ConnectionState.Reconnecting:
      icon = <AlertTriangle className="h-4 w-4 animate-pulse" />
      color = "bg-orange-500"
      text = "Reconnecting"
      break
    case ConnectionState.Disconnected:
      icon = <WifiOff className="h-4 w-4" />
      color = "bg-red-500"
      text = "Disconnected"
      break
  }

  return (
    <div className={`flex items-center gap-2 rounded-full px-2 py-1 text-xs text-white ${color} ${className}`}>
      {icon}
      <span>{text}</span>
    </div>
  )
}
