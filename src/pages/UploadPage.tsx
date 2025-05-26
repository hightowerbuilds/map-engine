import React, { useCallback, useState } from 'react'
import { Layout } from '../components/Layout'
import { UploadSuccessModal } from '../components/UploadSuccessModal'
import { ExtractedTransactions } from '../components/UploadPage/ExtractedTransactions'
import { PastUploads } from '../components/UploadPage/PastUploads'
import { UploadDropzone } from '../components/UploadPage/UploadDropzone'
import { UploadHeader } from '../components/UploadPage/UploadHeader'
import { UploadPreview } from '../components/UploadPage/UploadPreview'
import { useAuth } from '../contexts/AuthContext'
import { uploads } from '../lib/db/uploads'
import type { Transaction, Upload } from '../lib/db/uploads'

export function UploadPage() {
  const { user: authUser } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [pastUploads, setPastUploads] = useState<Array<Upload>>([])
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Array<Transaction>>([])

  const handleFileSelect = useCallback(async (file: File) => {
    if (!authUser) {
      setError('You must be logged in to upload files')
      return
    }

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      // Create upload record
      const uploadRecord = await uploads.create(authUser.id, file.name, file.size)
      setCurrentUploadId(uploadRecord.id)
      setSelectedFile(file)
      setShowSuccessModal(true)

      // Update upload status to completed
      await uploads.updateStatus(uploadRecord.id, 'completed')

      // Refresh uploads list
      const updatedUploads = await uploads.getByUserId(authUser.id)
      setPastUploads(updatedUploads)

    } catch (err) {
      console.error('Error uploading file:', err)
      setError('Failed to upload file. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [authUser])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    await handleFileSelect(e.dataTransfer.files[0])
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFileSelect(file)
    }
  }, [handleFileSelect])

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8 font-mono">
        <div className="max-w-2xl mx-auto">
          <UploadHeader />
          
          <UploadDropzone
            isDragging={isDragging}
            isProcessing={isProcessing}
            selectedFile={selectedFile}
            error={error}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFileSelect={handleFileInput}
          />
          
          <PastUploads uploads={pastUploads} />

          {/* Privacy Note */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Your data privacy is our priority. All uploaded statements are processed securely 
              and deleted after analysis. We only store the extracted spending data in your account.
            </p>
          </div>
        </div>
      </div>

      <UploadSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        fileName={selectedFile?.name || ''}
      />
    </Layout>
  )
}