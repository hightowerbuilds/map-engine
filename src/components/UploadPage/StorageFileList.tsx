import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { FileObject } from '@supabase/storage-js'

interface StorageFile extends Omit<FileObject, 'metadata'> {
  metadata: {
    size: number
    mimetype: string
  }
}

export function StorageFileList() {
  const { user: authUser, session, loading: authLoading } = useAuth()
  const [files, setFiles] = useState<Array<StorageFile>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

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
          throw bucketError
        }

        // List files in the user's directory
        const { data: filesData, error: filesError } = await supabase.storage
          .from('bank-statements')
          .list(authUser.id)

        if (filesError) {
          throw filesError
        }

        console.log('Files fetched successfully:', filesData)
        setFiles(filesData as Array<StorageFile>)
      } catch (err) {
        console.error('Error fetching files:', err)
        setError('Failed to fetch files. Please try again.')
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
      setError(null)
      setSelectedFile(fileName)

      const { data, error: signedUrlError } = await supabase.storage
        .from('bank-statements')
        .createSignedUrl(`${authUser.id}/${fileName}`, 3600) // 1 hour expiry

      if (signedUrlError) {
        throw signedUrlError
      }

      setPreviewUrl(data.signedUrl)
    } catch (err) {
      console.error('Error generating preview URL:', err)
      setError('Failed to generate preview. Please try again.')
    }
  }

  const handleDownload = async (fileName: string) => {
    if (!authUser) {
      console.error('No authenticated user found')
      return
    }

    try {
      setError(null)

      const { data, error: downloadError } = await supabase.storage
        .from('bank-statements')
        .download(`${authUser.id}/${fileName}`)

      if (downloadError) {
        throw downloadError
      }

      // Create a download link and trigger it
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName.split('/').pop() || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading file:', err)
      setError('Failed to download file. Please try again.')
    }
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
                title="File Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 