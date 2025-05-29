import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Layout } from '../components/Layout'
import { UploadSuccessModal } from '../components/UploadSuccessModal'
import { SpendingAnalysis } from '../components/UploadPage/SpendingAnalysis'
import { StorageFileList } from '../components/UploadPage/StorageFileList'
import { UploadDropzone } from '../components/UploadPage/UploadDropzone'
import { UploadHeader } from '../components/UploadPage/UploadHeader'
import { useAuth } from '../contexts/AuthContext'
import { geminiService } from '../lib/gemini'
import { uploads } from '../lib/db/uploads'
import { supabase } from '../lib/supabase'
import type { SpendingAnalysis as SpendingAnalysisType } from '../lib/gemini'
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
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState<SpendingAnalysisType | null>(null)

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
      setCurrentAnalysis(null)

      // Validate file type
      if (!file.type.includes('pdf')) {
        throw new Error('Only PDF files are supported')
      }

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
      setPdfPreviewUrl(data.signedUrl)
      setSelectedFile(file)
      setShowSuccessModal(true)

      try {
        // Download the file for analysis
        console.log('Downloading file for analysis...')
        const { data: pdfData, error: downloadError } = await supabase.storage
          .from('bank-statements')
          .download(filePath)

        if (downloadError) {
          console.error('Download error:', downloadError)
          // Don't set error state, just log it since the file was uploaded successfully
          console.error('Analysis download failed but file was uploaded:', downloadError)
          await uploads.updateStatus(uploadRecord.id, 'failed')
          return
        }

        // Convert to ArrayBuffer for PDF.js
        console.log('Converting file to ArrayBuffer...')
        const arrayBuffer = await pdfData.arrayBuffer()
        console.log('ArrayBuffer created, size:', arrayBuffer.byteLength)

        // Analyze the PDF with Gemini
        console.log('Starting PDF analysis with Gemini...')
        try {
          const analysis = await geminiService.analyzePDF(arrayBuffer)
          console.log('PDF analysis complete:', {
            locationCount: analysis.locations.length,
            transactionCount: analysis.summary.transactionCount,
            totalSpent: analysis.summary.totalSpent
          })

          // Store the analysis results
          console.log('Storing analysis results...')
          await uploads.saveAnalysis(uploadRecord.id, analysis)

          // Update the UI with the analysis
          setCurrentAnalysis(analysis)

          // Update upload status to completed
          await uploads.updateStatus(uploadRecord.id, 'completed')
        } catch (geminiError) {
          console.error('Gemini analysis error:', geminiError)
          // Update upload status to failed but keep the file
          await uploads.updateStatus(uploadRecord.id, 'failed')
          // Don't set error state, just log it since the file was uploaded successfully
          console.error('Analysis failed but file was uploaded:', geminiError)
        }
      } catch (analysisError) {
        console.error('Analysis error:', analysisError)
        // Update upload status to failed but keep the file
        await uploads.updateStatus(uploadRecord.id, 'failed')
        // Don't set error state, just log it since the file was uploaded successfully
        console.error('Analysis failed but file was uploaded:', analysisError)
      }
    } catch (err) {
      // Only set error state for actual upload failures
      if (err instanceof Error && err.message.includes('Failed to upload file')) {
        console.error('Upload error:', err)
        setError(err.message)
        setShowSuccessModal(false)
      } else {
        // For other errors, just log them but don't show to user
        console.error('Non-upload error:', err)
      }
    } finally {
      setIsProcessing(false)
    }
  }, [authUser, session])

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

  const handleModalClose = useCallback(async () => {
    setShowSuccessModal(false)
    setSelectedFile(null)
    setPdfPreviewUrl(null)
    setCurrentAnalysis(null)
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
          
          {currentAnalysis && (
            <SpendingAnalysis analysis={currentAnalysis} />
          )}

          {/* Privacy Note */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Your data privacy is our priority. All uploaded statements are stored securely 
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
        pdfUrl={pdfPreviewUrl}
      />
    </Layout>
  )
}