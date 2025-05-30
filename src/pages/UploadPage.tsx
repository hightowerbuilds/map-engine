import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Layout } from '../components/Layout'
import { UploadSuccessModal } from '../components/UploadSuccessModal'
import { StorageFileList } from '../components/UploadPage/StorageFileList'
import { UploadDropzone } from '../components/UploadPage/UploadDropzone'
import { UploadHeader } from '../components/UploadPage/UploadHeader'
import { useAuth } from '../contexts/AuthContext'
import { uploads } from '../lib/db/uploads'
import { supabase } from '../lib/supabase'
import type { Upload } from '../lib/db/uploads'

export function UploadPage() {
  const navigate = useNavigate()
  const { user: authUser, session, loading: authLoading } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Handle authentication and storage access
  useEffect(() => {
    if (authLoading) return

    const checkAccess = async () => {
      if (!authUser || !session) {
        console.log('No authenticated user or session, redirecting to home')
        navigate({ to: '/' })
        return
      }

      try {
        // Test storage access
        const { data: bucketData, error: bucketError } = await supabase
          .storage
          .getBucket('bank-statements')

        if (bucketError) {
          console.error('Bucket access error:', bucketError)
          // Don't set error in UI state during initial check
          return
        }

        // Clear any existing errors
        setError(null)
      } catch (err) {
        console.error('Access check error:', err)
        // Don't set error in UI state during initial check
      }
    }

    checkAccess()
  }, [authLoading, authUser, session, navigate])

  const handleFileSelect = useCallback(async (file: File) => {
    if (!authUser || !session) {
      setError('You must be logged in to upload files')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      // Create upload record
      console.log('Creating upload record...')
      const uploadRecord = await uploads.create(authUser.id, file.name, file.size)

      if (!uploadRecord) {
        throw new Error('Failed to create upload record')
      }

      setCurrentUploadId(uploadRecord.id)
      console.log('Upload record created:', uploadRecord.id)

      // Upload file to Supabase storage
      console.log('Uploading file to storage...')
      const filePath = `${authUser.id}/${uploadRecord.id}/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('bank-statements')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Failed to upload file: ${uploadError.message}`)
      }

      console.log('File uploaded successfully')

      // Generate signed URL for preview
      console.log('Generating signed URL...')
      const { data, error: signedUrlError } = await supabase.storage
        .from('bank-statements')
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      if (signedUrlError) {
        console.error('Signed URL error details:', {
          error: signedUrlError,
          message: signedUrlError.message,
          name: signedUrlError.name,
          stack: signedUrlError.stack
        })
        throw new Error(`Failed to generate preview URL: ${signedUrlError.message}`)
      }

      console.log('Generated signed URL successfully')
      setPreviewUrl(data.signedUrl)
      setSelectedFile(file)
      setShowSuccessModal(true)

      // Update upload status to completed
      await uploads.updateStatus(uploadRecord.id, 'completed')

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload file')
      if (currentUploadId) {
        await uploads.updateStatus(currentUploadId, 'failed')
      }
    } finally {
      setIsProcessing(false)
    }
  }, [authUser, session, currentUploadId])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleModalClose = useCallback(() => {
    setShowSuccessModal(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    setCurrentUploadId(null)
  }, [])

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8 font-mono">
        <div className="max-w-4xl mx-auto">
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

          {/* Privacy Note */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Your data privacy is our priority. All uploaded files are stored securely 
              in your private storage bucket.
            </p>
          </div>

          {/* Add the StorageFileList component */}
          <div className="mt-8">
            <StorageFileList />
          </div>
        </div>
      </div>

      <UploadSuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        fileName={selectedFile?.name || ''}
        previewUrl={previewUrl}
      />
    </Layout>
  )
}