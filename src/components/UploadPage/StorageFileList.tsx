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
    if (authLoading) {
      console.log('StorageFileList: Auth still loading...')
      return
    }

    if (!authUser || !session) {
      console.log('StorageFileList: No auth user or session:', { 
        authUser: authUser ? { id: authUser.id, email: authUser.email } : null,
        session: session ? { 
          access_token: session.access_token ? 'present' : 'missing',
          expires_at: session.expires_at,
          refresh_token: session.refresh_token ? 'present' : 'missing'
        } : null 
      })
      setError('Authentication required')
      setLoading(false)
      return
    }

    const loadFiles = async () => {
      try {
        console.log('StorageFileList: Starting file load for user:', {
          userId: authUser.id,
          email: authUser.email,
          hasSession: !!session,
          hasAccessToken: !!session.access_token,
          sessionExpiresAt: session.expires_at,
          currentTime: new Date().toISOString()
        })

        setLoading(true)
        setError(null)

        // Try to list the root of the bucket directly
        console.log('StorageFileList: Attempting to list bucket root...')
        const { data: rootFiles, error: rootError } = await supabase.storage
          .from('bank-statements')
          .list('')

        if (rootError) {
          console.error('StorageFileList: Error accessing bucket:', {
            error: rootError,
            message: rootError.message,
            name: rootError.name
          })
          throw new Error(`Storage access error: ${rootError.message}`)
        }

        console.log('StorageFileList: Successfully accessed bucket root:', rootFiles)

        // Now try to list the user's folder
        console.log('StorageFileList: Listing user folder:', authUser.id)
        const { data: userFolders, error: foldersError } = await supabase.storage
          .from('bank-statements')
          .list(authUser.id)

        if (foldersError) {
          console.error('StorageFileList: Error listing user folders:', {
            error: foldersError,
            message: foldersError.message,
            name: foldersError.name
          })
          throw foldersError
        }

        console.log('StorageFileList: Found user folders:', userFolders)

        // For each upload folder, list its contents
        const allFiles: Array<StorageFile> = []
        for (const folder of userFolders) {
          console.log('StorageFileList: Listing contents of folder:', folder.name)
          const { data: folderFiles, error: folderError } = await supabase.storage
            .from('bank-statements')
            .list(`${authUser.id}/${folder.name}`)

          if (folderError) {
            console.error('StorageFileList: Error listing folder contents:', {
              folder: folder.name,
              error: folderError,
              message: folderError.message,
              name: folderError.name
            })
            continue // Skip this folder if there's an error
          }

          console.log('StorageFileList: Found files in folder:', folder.name, folderFiles)

          // Add files from this folder to our list
          const pdfFiles = folderFiles
            .filter(file => file.metadata.mimetype === 'application/pdf')
            .map(file => ({
              ...file,
              name: `${folder.name}/${file.name}`, // Include the folder name in the file path
              metadata: {
                size: file.metadata.size,
                mimetype: file.metadata.mimetype
              },
              created_at: new Date(file.created_at).toLocaleDateString(),
              last_accessed_at: new Date(file.last_accessed_at).toLocaleDateString()
            })) as Array<StorageFile>

          allFiles.push(...pdfFiles)
        }

        console.log('StorageFileList: All processed PDF files:', allFiles)
        setFiles(allFiles)
      } catch (err) {
        console.error('StorageFileList: Error loading files:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          name: err instanceof Error ? err.name : 'Unknown',
          stack: err instanceof Error ? err.stack : undefined
        })
        setError(err instanceof Error ? err.message : 'Failed to load files. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadFiles()
  }, [authUser, session, authLoading])

  const handlePreview = async (fileName: string) => {
    try {
      setError(null)
      setSelectedFile(fileName)

      const { data, error: urlError } = await supabase.storage
        .from('bank-statements')
        .createSignedUrl(`${authUser?.id}/${fileName}`, 3600) // fileName now includes the folder path

      if (urlError) throw urlError
      setPreviewUrl(data.signedUrl)
    } catch (err) {
      console.error('Error generating preview URL:', err)
      setError('Failed to generate preview. Please try again.')
      setSelectedFile(null)
    }
  }

  const handleDownload = async (fileName: string) => {
    try {
      setError(null)

      const { data, error: downloadError } = await supabase.storage
        .from('bank-statements')
        .download(`${authUser?.id}/${fileName}`) // fileName now includes the folder path

      if (downloadError) throw downloadError

      // Create a download link and trigger it
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName.split('/').pop() || fileName // Use just the filename for download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading file:', err)
      setError('Failed to download file. Please try again.')
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return

    try {
      setError(null)

      const { error: deleteError } = await supabase.storage
        .from('bank-statements')
        .remove([`${authUser?.id}/${fileName}`]) // fileName now includes the folder path

      if (deleteError) throw deleteError

      // Remove the file from the local state
      setFiles(files.filter(file => file.name !== fileName))
    } catch (err) {
      console.error('Error deleting file:', err)
      setError('Failed to delete file. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Loading files...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No files uploaded yet.</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Your Bank Statements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file) => (
          <div 
            key={file.name} 
            className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Uploaded: {file.created_at}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {(file.metadata.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex space-x-2">
                <button
                  onClick={() => handlePreview(file.name)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Preview
                </button>
                <button
                  onClick={() => handleDownload(file.name)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(file.name)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
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
    </div>
  )
} 