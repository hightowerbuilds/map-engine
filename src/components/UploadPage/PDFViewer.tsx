import React from 'react'

interface PDFViewerProps {
  file: File | null
}

export function PDFViewer({ file }: PDFViewerProps) {
  if (!file) {
    return null
  }

  return (
    <div className="mt-8 border rounded-lg p-4 bg-gray-50">
      <p className="text-center text-gray-600">
        PDF preview will be implemented here
      </p>
    </div>
  )
} 