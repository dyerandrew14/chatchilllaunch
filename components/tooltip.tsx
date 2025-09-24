"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: string
  position?: "top" | "bottom" | "left" | "right"
  className?: string
  showArrow?: boolean
  duration?: number // in milliseconds, 0 means permanent
  children: React.ReactNode
}

export function Tooltip({
  content,
  position = "top",
  className = "",
  showArrow = true,
  duration = 0,
  children,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  if (!isVisible) return <>{children}</>

  return (
    <div className="relative inline-block">
      {children}
      <div
        className={cn(
          "absolute z-50 px-3 py-2 text-sm font-medium text-white bg-black/90 rounded-md shadow-lg whitespace-nowrap",
          position === "top" && "bottom-[calc(100%+10px)] left-1/2 transform -translate-x-1/2",
          position === "bottom" && "top-[calc(100%+10px)] left-1/2 transform -translate-x-1/2",
          position === "left" && "right-[calc(100%+10px)] top-1/2 transform -translate-y-1/2",
          position === "right" && "left-[calc(100%+10px)] top-1/2 transform -translate-y-1/2",
          className,
        )}
      >
        {content}
        {showArrow && (
          <div
            className={cn(
              "absolute w-0 h-0",
              position === "top" &&
                "bottom-[-6px] left-1/2 transform -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90",
              position === "bottom" &&
                "top-[-6px] left-1/2 transform -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-black/90",
              position === "left" &&
                "right-[-6px] top-1/2 transform -translate-y-1/2 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-black/90",
              position === "right" &&
                "left-[-6px] top-1/2 transform -translate-y-1/2 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-black/90",
            )}
          />
        )}
      </div>
    </div>
  )
}
