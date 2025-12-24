'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, X, Save, UserPlus } from 'lucide-react'
import type { UploadGroup } from '@/types/database'

interface EditFormProps {
  group: UploadGroup
  canManageEditors: boolean
}

export function EditForm({ group, canManageEditors }: EditFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [title, setTitle] = useState(group.title || '')
  const [notes, setNotes] = useState(group.notes || '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(group.tags || [])
  const [editorEmail, setEditorEmail] = useState('')
  const [editors, setEditors] = useState<string[]>(group.editors || [])
  const [saving, setSaving] = useState(false)
  const [addingEditor, setAddingEditor] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editorProfiles, setEditorProfiles] = useState<Record<string, string>>({})

  // Load editor profiles on mount
  useEffect(() => {
    if (editors.length > 0) {
      supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', editors)
        .then(({ data }) => {
          if (data) {
            const profiles: Record<string, string> = {}
            data.forEach(p => {
              profiles[p.id] = p.display_name || 'Unknown'
            })
            setEditorProfiles(profiles)
          }
        })
    }
  }, [editors, supabase])

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

  const addEditor = async () => {
    const email = editorEmail.trim().toLowerCase()
    if (!email) return

    setAddingEditor(true)
    setError(null)

    try {
      // Look up user by email
      const { data: profile, error: lookupError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', email) // Note: This assumes email is stored as id, adjust if needed
        .single()

      if (lookupError || !profile) {
        setError('User not found')
        return
      }

      if (editors.includes(profile.id)) {
        setError('User is already an editor')
        return
      }

      setEditors(prev => [...prev, profile.id])
      setEditorProfiles(prev => ({ ...prev, [profile.id]: profile.display_name || 'Unknown' }))
      setEditorEmail('')
      
    } catch {
      setError('Failed to add editor')
    } finally {
      setAddingEditor(false)
    }
  }

  const removeEditor = (editorId: string) => {
    setEditors(prev => prev.filter(id => id !== editorId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSaving(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('upload_groups')
        .update({
          title: title || 'Untitled Upload',
          notes: notes || null,
          tags: tags.length > 0 ? tags : null,
          editors: editors.length > 0 ? editors : null,
        })
        .eq('id', group.id)

      if (updateError) throw updateError

      // Success! Go back to detail page
      router.push(`/files/${group.id}`)
      router.refresh()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving. You may not have permission to edit this group.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Group Information</CardTitle>
          <CardDescription>Update metadata for this upload group</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              disabled={saving}
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
              disabled={saving}
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
                disabled={saving}
              />
              <Button type="button" onClick={addTag} disabled={!tagInput.trim() || saving}>
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
                      disabled={saving}
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

      {canManageEditors && (
        <Card>
          <CardHeader>
            <CardTitle>Editors</CardTitle>
            <CardDescription>Grant edit access to other users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={editorEmail}
                onChange={(e) => setEditorEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addEditor()
                  }
                }}
                placeholder="Enter user email or ID"
                disabled={saving || addingEditor}
              />
              <Button
                type="button"
                onClick={addEditor}
                disabled={!editorEmail.trim() || saving || addingEditor}
              >
                {addingEditor ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Add
              </Button>
            </div>

            {editors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{editors.length} editor{editors.length !== 1 ? 's' : ''}</p>
                {editors.map((editorId) => (
                  <div
                    key={editorId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div>
                      <p className="text-sm font-medium">{editorProfiles[editorId] || 'Loading...'}</p>
                      <p className="text-xs text-muted-foreground">{editorId}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEditor(editorId)}
                      disabled={saving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/files/${group.id}`)}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
