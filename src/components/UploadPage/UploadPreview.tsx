import React from 'react'

interface UploadPreviewProps {
  preview: string | null
}

export function UploadPreview({ preview }: UploadPreviewProps) {
  if (!preview) return null

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Preview</h2>
      <div className="border rounded-lg overflow-hidden">
        <img 
          src={preview} 
          alt="PDF Preview" 
          className="w-full h-auto"
        />
      </div>
    </div>
  )
} 