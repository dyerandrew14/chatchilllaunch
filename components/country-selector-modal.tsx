"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { COUNTRIES } from "@/lib/constants"

interface CountrySelectorModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCountry: { code: string; name: string; flag: string }
  onSelectCountry: (country: { code: string; name: string; flag: string }) => void
}

export function CountrySelectorModal({ isOpen, onClose, selectedCountry, onSelectCountry }: CountrySelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  if (!isOpen) return null

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-medium">Select Country</h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>

          <div className="h-80 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {filteredCountries.map((country) => (
                <div
                  key={country.code}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-800 ${
                    selectedCountry.code === country.code ? "bg-gray-800 border border-gray-600" : ""
                  }`}
                  onClick={() => {
                    onSelectCountry(country)
                    onClose()
                  }}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-sm truncate">{country.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
