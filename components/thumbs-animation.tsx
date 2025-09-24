"use client"

import { useEffect, useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface ThumbsAnimationProps {
  type: "up" | "down"
}

export function ThumbsAnimation({ type }: ThumbsAnimationProps) {
  const [animations, setAnimations] = useState<Array<{ id: number; x: number; delay: number }>>([])

  useEffect(() => {
    // Create multiple animations with different positions and delays
    const newAnimations = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10, // Random position between 10% and 90%
      delay: Math.random() * 0.5, // Random delay between 0 and 0.5s
    }))

    setAnimations(newAnimations)

    // Clean up animations after they complete
    const timer = setTimeout(() => {
      setAnimations([])
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {animations.map((anim) => (
        <div
          key={anim.id}
          className="absolute bottom-0 animate-float"
          style={{
            left: `${anim.x}%`,
            animationDelay: `${anim.delay}s`,
            opacity: 0,
          }}
        >
          {type === "up" ? (
            <ThumbsUp className="h-12 w-12 text-green-500" />
          ) : (
            <ThumbsDown className="h-12 w-12 text-red-500" />
          )}
        </div>
      ))}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
