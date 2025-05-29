import React from 'react'

interface PdfParseModalProps {
  isOpen: boolean
  onClose: () => void
  content: string | null
  error: string | null
  isProcessing: boolean
}

export function PdfParseModal({ isOpen, onClose, content, error, isProcessing }: PdfParseModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">PDF Content</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isProcessing ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Processing PDF...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        ) : content ? (
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {content}
          </div>
        ) : null}
      </div>
    </div>
  )
} 