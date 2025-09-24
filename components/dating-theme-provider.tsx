"use client"

import { createContext, useContext, type ReactNode } from "react"

interface DatingThemeContextType {
  isDatingMode: boolean
}

const DatingThemeContext = createContext<DatingThemeContextType>({
  isDatingMode: false,
})

interface DatingThemeProviderProps {
  children: ReactNode
  isDatingMode: boolean
}

export function DatingThemeProvider({ children, isDatingMode }: DatingThemeProviderProps) {
  return (
    <DatingThemeContext.Provider value={{ isDatingMode }}>
      <div className={isDatingMode ? "dating-theme" : ""}>
        {isDatingMode && (
          <style jsx global>{`
            .dating-theme .video-container {
              border: 2px solid rgba(236, 72, 153, 0.3);
              box-shadow: 0 0 15px rgba(236, 72, 153, 0.2);
            }
            
            .dating-theme .lobby-title {
              color: #ec4899;
            }
            
            .dating-theme .match-button {
              background: linear-gradient(to right, #ec4899, #d946ef);
              border: none;
            }
            
            .dating-theme .match-button:hover {
              background: linear-gradient(to right, #db2777, #c026d3);
            }
          `}</style>
        )}
        {children}
      </div>
    </DatingThemeContext.Provider>
  )
}

export const useDatingTheme = () => useContext(DatingThemeContext)
