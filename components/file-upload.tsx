"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, X } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File, preview: string) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSend = () => {
    if (selectedFile && preview) {
      onFileSelect(selectedFile, preview)
      setPreview(null)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleCancel = () => {
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {!preview ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-gray-700 hover:bg-gray-600"
          onClick={handleUploadClick}
        >
          <ImageIcon className="h-5 w-5 text-gray-300" />
        </Button>
      ) : (
        <div className="p-2 bg-gray-800 rounded-md">
          <div className="relative h-40 w-full mb-2">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="h-full w-full object-contain rounded-md"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 hover:bg-black/70"
              onClick={handleCancel}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex justify-end">
            <Button size="sm" className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={handleSend}>
              Send Image
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
