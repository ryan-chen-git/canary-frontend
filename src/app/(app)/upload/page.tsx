'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload as UploadIcon, X, FileText, Loader2 } from 'lucide-react'
import { formatBytes } from '@/lib/utils'

interface SelectedFile {
  file: File
  id: string
}

export default function UploadPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [files, setFiles] = useState<SelectedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const newFiles: SelectedFile[] = selectedFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (files.length === 0) {
      setError('Please select at least one file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to upload files')
      }

      // 1. Create upload group
      const response = await supabase
        .from('upload_groups')
        .insert({
          uploader_id: user.id,
          title: title || 'Untitled Upload',
          notes: notes || null,
          tags: tags.length > 0 ? tags : null,
        })
        .select()
        .single()

      console.log('Full response:', response)
      console.log('Response data:', response.data)
      console.log('Response error:', response.error)
      console.log('Response status:', response.status)
      console.log('Response statusText:', response.statusText)

      if (response.error) {
        const err = response.error
        console.error('Group creation error:', err)
        console.error('Error type:', typeof err)
        console.error('Error keys:', Object.keys(err))
        console.error('Error code:', err.code)
        console.error('Error message:', err.message)
        console.error('Error details:', err.details)
        console.error('Error hint:', err.hint)
        throw new Error(`Failed to create group: ${err.message || err.code || 'Check console for details'}`)
      }

      const group = response.data
      if (!group) {
        throw new Error('No group returned from database')
      }

      // 2. Upload files to storage and create file records
      const fileRecords = []
      let position = 0

      for (const selectedFile of files) {
        const { file, id } = selectedFile
        
        // Generate unique storage path: raw/{uuid}
        const fileId = crypto.randomUUID()
        const storagePath = `raw/${fileId}`
        
        // Upload to storage
        setUploadProgress(prev => ({ ...prev, [id]: 0 }))
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError)
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }

        setUploadProgress(prev => ({ ...prev, [id]: 100 }))

        // Determine file type from extension
        const fileType = file.name.split('.').pop()?.toLowerCase() || null

        fileRecords.push({
          group_id: group.id,
          original_filename: file.name,
          file_type: fileType,
          content_type: file.type || null,
          size_bytes: file.size,
          storage_path: storagePath,
          position: position++,
        })
      }

      // 3. Insert all file records
      const { error: filesError } = await supabase
        .from('upload_files')
        .insert(fileRecords)

      if (filesError) {
        console.error('Failed to create file records:', filesError)
        throw new Error(`Failed to create file records: ${filesError.message}`)
      }

      // Success! Redirect to the new group
      router.push(`/logs/${group.id}`)
      
    } catch (err) {
      console.error('Upload error:', err)
      console.error('Upload error details:', JSON.stringify(err, null, 2))
      
      let errorMessage = 'An error occurred during upload'
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err)
      }
      
      setError(errorMessage)
      setUploading(false)
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Files</h1>
        <p className="text-muted-foreground">Create a new upload group with files</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Group Information</CardTitle>
            <CardDescription>Metadata for this upload group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or context"
                rows={3}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Type a tag and press Enter"
                  disabled={uploading}
                />
                <Button type="button" onClick={addTag} disabled={!tagInput.trim() || uploading}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        disabled={uploading}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>Select files to upload</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">Click to select files</p>
                <p className="text-xs text-muted-foreground">or drag and drop</p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{files.length} file{files.length !== 1 ? 's' : ''} selected</p>
                {files.map((selectedFile) => {
                  const progress = uploadProgress[selectedFile.id]
                  return (
                    <div
                      key={selectedFile.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedFile.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(selectedFile.file.size)}
                          </p>
                          {progress !== undefined && (
                            <div className="w-full bg-secondary h-1 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(selectedFile.id)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={uploading || files.length === 0}>
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/logs')}
            disabled={uploading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
