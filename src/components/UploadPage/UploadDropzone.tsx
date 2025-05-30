import React from 'react'

interface UploadDropzoneProps {
  isDragging: boolean
  isProcessing: boolean
  selectedFile: File | null
  error: string | null
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function UploadDropzone({
  isDragging,
  isProcessing,
  selectedFile,
  error,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
}: UploadDropzoneProps) {
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="mb-4">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
          />
        </svg>
      </div>
      <p className="text-gray-600 mb-4">
        {isProcessing 
          ? 'Processing file...' 
          : selectedFile 
            ? `Selected: ${selectedFile.name}`
            : 'Drag and drop your file here, or click to select a file'
        }
      </p>
      <input
        type="file"
        onChange={onFileSelect}
        className="hidden"
        id="file-input"
      />
      <label
        htmlFor="file-input"
        className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors cursor-pointer inline-block"
      >
        Select File
      </label>
      <p className="mt-2 text-sm text-gray-500">
        Maximum file size: 10MB
      </p>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
} 