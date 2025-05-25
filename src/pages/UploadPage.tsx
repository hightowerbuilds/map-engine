import * as pdfjsLib from 'pdfjs-dist'
import React, { useCallback, useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { UploadSuccessModal } from '../components/UploadSuccessModal'
import { useAuth } from '../contexts/AuthContext'
import { uploads } from '../lib/db/uploads'
import type { Upload } from '../lib/db/uploads'

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export function UploadPage() {
  const { user: authUser } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [pastUploads, setPastUploads] = useState<Array<Upload>>([])

  // Fetch past uploads when component mounts
  useEffect(() => {
    const fetchUploads = async () => {
      if (!authUser) return
      try {
        const uploadsList = await uploads.getByUserId(authUser.id)
        setPastUploads(uploadsList)
      } catch (err) {
        console.error('Error fetching uploads:', err)
      }
    }
    fetchUploads()
  }, [authUser])

  const processPDF = async (file: File) => {
    if (!authUser) {
      setError('You must be logged in to upload files')
      return
    }

    let uploadRecord: Upload | null = null
    try {
      setIsProcessing(true)
      setError(null)

      // Create upload record
      uploadRecord = await uploads.create(authUser.id, file.name, file.size)

      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      // Get total number of pages
      const numPages = pdf.numPages
      console.log(`Processing PDF with ${numPages} pages`)

      // Array to store text from all pages
      const allPagesText: Array<string> = []
      
      // Process each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        // Get the page
        const page = await pdf.getPage(pageNum)
        
        // Get the text content
        const textContent = await page.getTextContent()
        
        // Extract text from the content
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        
        allPagesText.push(pageText)

        // Only create preview for first page
        if (pageNum === 1) {
          // Create a preview of the first page
          const viewport = page.getViewport({ scale: 1.0 })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) {
            throw new Error('Failed to get canvas context')
          }
          canvas.height = viewport.height
          canvas.width = viewport.width

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise

          setPreview(canvas.toDataURL())
        }
      }

      // Combine all page text
      const fullText = allPagesText.join('\n\n')
      console.log('Extracted text from all pages:', fullText)

      // Update upload status to completed
      await uploads.updateStatus(uploadRecord.id, 'completed')

      // Update local state
      setSelectedFile(file)
      setShowSuccessModal(true)
      
      // Refresh uploads list
      const updatedUploads = await uploads.getByUserId(authUser.id)
      setPastUploads(updatedUploads)
    } catch (err) {
      console.error('Error processing PDF:', err)
      setError('Failed to process PDF file. Please try again.')
      // Update upload status to failed if we created a record
      if (uploadRecord) {
        await uploads.updateStatus(uploadRecord.id, 'failed')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB')
      return
    }

    await processPDF(file)
  }, [])

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
          {/* Header */}
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

          {/* Upload Section */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
                ? 'Processing PDF...' 
                : selectedFile 
                  ? `Selected: ${selectedFile.name}`
                  : 'Drag and drop your bank statement here, or click to select a file'
              }
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
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
              Supported format: PDF (max 10MB)
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* Preview Section */}
          {preview && (
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
          )}

          {/* Past Uploads Section */}
          {pastUploads.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-semibold mb-4">Past Uploads</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pastUploads.map((upload) => (
                      <tr key={upload.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {upload.file_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(upload.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            upload.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : upload.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {upload.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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