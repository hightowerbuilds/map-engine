import React from 'react'

export function UploadHeader() {
  return (
    <div className="mb-12">
      <h1 className="text-3xl font-bold text-black mb-4">Bank Statement Analysis</h1>
      <p className="text-gray-800 leading-relaxed">
        Upload your bank statement to automatically analyze your spending patterns. 
        Our AI will:
      </p>
      <ul className="list-disc list-inside mt-4 space-y-2 text-gray-800">
        <li>Extract spending locations and amounts</li>
        <li>Categorize transactions automatically</li>
        <li>Update your spending map with new data</li>
      </ul>
    </div>
  )
} 