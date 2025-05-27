import React from 'react'

interface UploadSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  pdfUrl: string | null
}

export function UploadSuccessModal({ isOpen, onClose, fileName, pdfUrl }: UploadSuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload Successful
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {fileName} has been successfully uploaded.
          </p>
          
          {pdfUrl && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  src={pdfUrl}
                  className="w-full h-96"
                  title="PDF Preview"
                />
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 