import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { EditForm } from './_components/edit-form'

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  // TEMPORARILY DISABLED FOR DEVELOPMENT - Re-enable before production!
  // if (!user) {
  //   redirect('/login')
  // }
  
  // MOCK USER FOR DEVELOPMENT - Remove before production!
  const mockUser = user || { id: 'dev-user-id', email: 'dev@example.com' } as any

  // Fetch the upload group
  const { data: group, error } = await supabase
    .from('upload_groups')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !group) {
    notFound()
  }

  // Fetch user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', mockUser.id)
    .single()

  // Check permissions: must be owner, editor, or admin
  const isOwner = group.uploader_id === mockUser.id
  const isEditor = group.editors?.includes(mockUser.id) || false
  const isAdmin = profile?.role === 'admin'

  if (!isOwner && !isEditor && !isAdmin) {
    notFound()
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Upload Group</h1>
        <p className="text-muted-foreground">Update metadata for this upload group</p>
      </div>

      <EditForm
        group={group}
        canManageEditors={isOwner || isAdmin}
      />
    </div>
  )
}
