import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import type { UploadGroupWithFiles, Profile } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Calendar, User, FileText, Lock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatBytes } from '@/lib/utils'

export default async function LogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // TEMPORARILY DISABLED FOR DEVELOPMENT - Re-enable before production!
  // if (!user) {
  //   redirect('/login')
  // }
  
  // MOCK USER FOR DEVELOPMENT - Remove before production!
  const mockUser = user || { id: 'dev-user-id', email: 'dev@example.com' } as any

  // Fetch the upload group with its files
  const { data: group, error } = await supabase
    .from('upload_groups')
    .select(`
      *,
      upload_files (
        id,
        original_filename,
        file_type,
        content_type,
        size_bytes,
        storage_path,
        position,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (error || !group) {
    notFound()
  }

  // Get user's role and uploader profile
  const [{ data: profile }, { data: uploaderProfile }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', mockUser.id).single(),
    supabase.from('profiles').select('display_name, role').eq('id', group.uploader_id).single(),
  ])

  const userRole = profile?.role || 'member'
  const isOwner = group.uploader_id === mockUser.id
  const isEditor = group.editors?.includes(mockUser.id) || false
  const isAdmin = userRole === 'admin'
  const canEdit = isOwner || isEditor || isAdmin

  // Sort files by position
  const sortedFiles = [...(group.upload_files || [])].sort((a, b) => a.position - b.position)

  // Generate signed URLs for downloads
  const filesWithUrls = await Promise.all(
    sortedFiles.map(async (file) => {
      const { data } = await supabase.storage
        .from('uploads')
        .createSignedUrl(file.storage_path, 3600) // 1 hour expiry
      
      return {
        ...file,
        downloadUrl: data?.signedUrl,
      }
    })
  )

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/files">
            <ArrowLeft className="h-4 w-4" />
            Back to Logs
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{group.title}</h1>
            {!canEdit && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                Read-only
              </Badge>
            )}
          </div>
          {group.notes && (
            <p className="text-muted-foreground mt-2">{group.notes}</p>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/files/${id}/edit`}>Edit</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2">
            <CardTitle className="text-sm font-medium">Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 py-0 pb-2">
            <div className="text-2xl font-bold">{filesWithUrls.length}</div>
          </CardContent>
        </Card>
        <Card className="py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2">
            <CardTitle className="text-sm font-medium">Uploaded By</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 py-0 pb-2">
            <div className="text-sm font-medium">
              {uploaderProfile?.display_name || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {uploaderProfile?.role || 'member'}
            </p>
          </CardContent>
        </Card>
        <Card className="py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 py-0 pb-2">
            <div className="text-sm">
              {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>
        <Card className="py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 py-0 pb-2">
            <div className="text-sm">
              {group.files_updated_at
                ? formatDistanceToNow(new Date(group.files_updated_at), { addSuffix: true })
                : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {group.tags && group.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {group.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>
            {filesWithUrls.length} file{filesWithUrls.length !== 1 ? 's' : ''} in this group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filesWithUrls.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No files in this group</p>
          ) : (
            <div className="space-y-2">
              {filesWithUrls.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.original_filename}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {file.file_type && (
                        <Badge variant="outline" className="text-xs">
                          {file.file_type}
                        </Badge>
                      )}
                      <span>{formatBytes(file.size_bytes)}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  {file.downloadUrl && (
                    <Button asChild size="sm" variant="ghost">
                      <a href={file.downloadUrl} download={file.original_filename}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
