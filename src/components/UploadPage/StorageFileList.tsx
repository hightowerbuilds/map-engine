import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PdfParseModal } from './PdfParseModal'
import type { FileObject } from '@supabase/storage-js'

interface StorageFile extends Omit<FileObject, 'metadata'> {
  metadata: {
    size: number
    mimetype: string
  }
}

interface ParsedPdfData {
  numpages: number
  numrender: number
  info: any
  metadata: any
  version: string
  text: string
}

export function StorageFileList() {
  const { user: authUser, session, loading: authLoading } = useAuth()
  const [files, setFiles] = useState<Array<StorageFile>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedContent, setParsedContent] = useState<ParsedPdfData | null>(null)
  const [showParseModal, setShowParseModal] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!authUser) {
      setFiles([])
      setLoading(false)
      return
    }

    const fetchFiles = async () => {
      try {
        console.log('=== Starting file fetch ===')
        console.log('Auth user:', authUser.id)
        
        // First check project status
        const { data: projectData, error: projectError } = await supabase
          .from('storage.buckets')
          .select('*')
          .limit(1)

        console.log('Project status check:', {
          success: !projectError,
          error: projectError,
          data: projectData
        })

        if (projectError) {
          if (projectError.message.includes('permission denied') || projectError.message.includes('not found')) {
            console.error('Project access error - this might be due to subscription/payment issues')
            setError('Unable to access storage. Please check your Supabase subscription status.')
            setLoading(false)
            return
          }
          throw projectError
        }

        // Now try to access the bucket
        const { data: bucketData, error: bucketError } = await supabase.storage
          .getBucket('bank-statements')
        
        console.log('Bucket access check:', {
          success: !bucketError,
          error: bucketError,
          bucketData
        })

        if (bucketError) {
          if (bucketError.message.includes('not found')) {
            console.error('Bucket not found - this might be due to subscription/payment issues')
            setError('Storage bucket not found. Please check your Supabase subscription status.')
            setLoading(false)
            return
          }
          console.error('Cannot access bucket:', bucketError)
          throw bucketError
        }

        // Now try to list files
        console.log('Listing files in path:', `${authUser.id}/`)
        const { data, error } = await supabase.storage
          .from('bank-statements')
          .list(`${authUser.id}/`, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
            search: ''
          })

        console.log('Raw storage response:', {
          success: !error,
          error,
          data: JSON.stringify(data, null, 2)
        })

        if (error) {
          console.error('Storage list error:', error)
          throw error
        }

        if (!data) {
          console.log('No data returned from storage')
          setFiles([])
          setLoading(false)
          return
        }

        // Get all files recursively
        const allFiles: Array<StorageFile> = []
        console.log('Processing items:', data.length)
        
        for (const item of data) {
          console.log('Processing item:', {
            name: item.name,
            id: item.id,
            metadata: item.metadata,
            created_at: item.created_at,
            last_accessed_at: item.last_accessed_at,
            updated_at: item.updated_at
          })

          if (!item.name.endsWith('/')) {
            console.log('Adding file:', item.name)
            allFiles.push(item as StorageFile)
          } else {
            const folderName = item.name.slice(0, -1)
            console.log('Found folder:', folderName)
            
            const { data: folderData, error: folderError } = await supabase.storage
              .from('bank-statements')
              .list(`${authUser.id}/${folderName}/`)
            
            console.log('Folder contents:', {
              folder: folderName,
              success: !folderError,
              error: folderError,
              items: folderData?.length || 0
            })

            if (folderError) {
              console.error('Error listing folder contents:', folderError)
              continue
            }

            folderData.forEach(file => {
              if (!file.name.endsWith('/')) {
                console.log('Adding file from folder:', `${folderName}/${file.name}`)
                allFiles.push({
                  ...file,
                  name: `${folderName}/${file.name}`
                } as StorageFile)
              }
            })
          }
        }

        console.log('Final file list:', {
          totalFiles: allFiles.length,
          files: allFiles.map(f => ({
            name: f.name,
            id: f.id,
            created_at: f.created_at
          }))
        })

        setFiles(allFiles)
      } catch (err) {
        console.error('Error in fetchFiles:', err)
        setError('Failed to load files')
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [authUser, authLoading])

  const handlePreview = async (fileName: string) => {
    if (!authUser) {
      console.error('No authenticated user found')
      return
    }

    try {
      console.log('Preview operation:')
      console.log('- User ID:', authUser.id)
      console.log('- File name from list:', fileName)
      console.log('- Full path being used:', `${authUser.id}/${fileName}`)

      const { data, error } = await supabase.storage
        .from('bank-statements')
        .createSignedUrl(`${authUser.id}/${fileName}`, 60)

      if (error) {
        console.error('Preview error details:', {
          error,
          message: error.message,
          name: error.name
        })
        throw error
      }

      console.log('Preview URL generated successfully')
      setPreviewUrl(data.signedUrl)
      setSelectedFile(fileName)
    } catch (err) {
      console.error('Error generating preview URL:', err)
      setError('Failed to generate preview')
    }
  }

  const handleDownload = async (fileName: string) => {
    if (!authUser) {
      console.error('No authenticated user found')
      return
    }

    try {
      console.log('Download file name:', fileName)
      const { data, error } = await supabase.storage
        .from('bank-statements')
        .download(`${authUser.id}/${fileName}`)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName.split('/').pop() || 'download'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading file:', err)
      setError('Failed to download file')
    }
  }

  const handleProcess = async (fileName: string) => {
    if (!authUser) {
      console.error('No authenticated user found')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setParsedContent(null)
      setShowParseModal(true)

      console.log('Process operation:')
      console.log('- User ID:', authUser.id)
      console.log('- File name from list:', fileName)
      console.log('- Full path being used:', `${authUser.id}/${fileName}`)

      const { data: pdfData, error: downloadError } = await supabase.storage
        .from('bank-statements')
        .download(`${authUser.id}/${fileName}`)

      if (downloadError) {
        console.error('Process download error details:', {
          error: downloadError,
          message: downloadError.message,
          name: downloadError.name
        })
        throw downloadError
      }

      console.log('File downloaded successfully:', {
        size: pdfData.size,
        type: pdfData.type
      })

      // Create FormData and append the PDF file
      const formData = new FormData()
      const displayName = fileName.split('/').pop() || 'download.pdf'
      formData.append('pdf', pdfData, displayName)
      console.log('FormData created with file:', displayName)

      // Send to our server for processing
      console.log('Sending to server for processing...')
      const response = await fetch('http://localhost:3001/api/parse-pdf', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server processing error:', errorData)
        throw new Error(errorData.error || 'Failed to process PDF')
      }

      const result = await response.json()
      console.log('PDF processed successfully:', {
        numpages: result.data.numpages,
        numrender: result.data.numrender,
        info: result.data.info,
        version: result.data.version
      })

      setParsedContent(result.data)
    } catch (err) {
      console.error('Error processing PDF:', err)
      setError('Failed to process PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseParseModal = () => {
    setShowParseModal(false)
    setParsedContent(null)
    setError(null)
  }

  if (loading) {
    return <div className="mt-8">Loading files...</div>
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Your Bank Statements</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {files.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="font-medium">{file.name.split('/').pop()}</p>
                <p className="text-sm text-gray-500">
                  {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePreview(file.name)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Preview
              </button>
              <button
                onClick={() => handleProcess(file.name)}
                disabled={isProcessing}
                className={`px-3 py-1 text-sm ${
                  isProcessing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                } rounded transition-colors`}
              >
                {isProcessing ? 'Processing...' : 'Process'}
              </button>
              <button
                onClick={() => handleDownload(file.name)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewUrl && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {files.find(f => f.name === selectedFile)?.name}
              </h3>
              <button
                onClick={() => {
                  setPreviewUrl(null)
                  setSelectedFile(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <iframe
                src={previewUrl}
                className="w-full h-[80vh]"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* PDF Parse Modal */}
      <PdfParseModal
        isOpen={showParseModal}
        onClose={handleCloseParseModal}
        content={parsedContent?.text || null}
        error={error}
        isProcessing={isProcessing}
      />
    </div>
  )
} 