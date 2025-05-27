import React from 'react'

export function UploadHeader() {
  return (
    <div className="mb-12">
      <h1 className="text-3xl font-bold text-black mb-4">Bank Statement Upload</h1>
      <p className="text-gray-800 leading-relaxed">
        Upload your bank statement to securely store it in your private storage bucket.
      </p>
      <ul className="list-disc list-inside mt-4 space-y-2 text-gray-800">
        <li>Secure storage in your private bucket</li>
        <li>Easy access to your statements</li>
        <li>View statements directly in your browser</li>
      </ul>
    </div>
  )
} 