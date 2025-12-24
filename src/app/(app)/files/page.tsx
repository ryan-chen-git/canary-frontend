import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import type { UploadGroupWithAccess } from '@/types/database'
import { Button } from '@/components/ui/button'
import { FilesFilters } from './_components/logs-filters'
import { FilesTable } from './_components/logs-table'

interface LogsPageProps {
  searchParams: Promise<{
    search?: string
    tag?: string
    sort?: string
    page?: string
  }>
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's role to determine access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'member'

  const params = await searchParams
  const search = params.search || ''
  const tag = params.tag || ''
  const sort = params.sort || 'date-desc'
  const page = Number.parseInt(params.page || '1', 10)
  const perPage = 20
  const offset = (page - 1) * perPage

  // Build query for upload groups
  // Members can only view, uploaders/admins can see all groups
  let query = supabase
    .from('upload_groups')
    .select('*, upload_files(count)', { count: 'exact' })

  // Apply search filter (searches title and notes)
  if (search) {
    query = query.or(`title.ilike.%${search}%,notes.ilike.%${search}%`)
  }

  // Apply tag filter
  if (tag) {
    query = query.contains('tags', [tag])
  }

  // Apply sorting
  switch (sort) {
    case 'date-asc':
      query = query.order('created_at', { ascending: true })
      break
    case 'updated':
      query = query.order('files_updated_at', { ascending: false, nullsFirst: false })
      break
    case 'title':
      query = query.order('title', { ascending: true })
      break
    case 'date-desc':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Apply pagination
  query = query.range(offset, offset + perPage - 1)

  const { data: uploadGroups, error, count } = await query

  // Get all unique tags for filter dropdown
  const { data: allTags } = await supabase.rpc('get_unique_tags')

  // Transform data to include access info
  const groupsWithAccess: UploadGroupWithAccess[] = (uploadGroups || []).map(group => {
    const isOwner = group.uploader_id === user.id
    const isEditor = group.editors?.includes(user.id) || false
    const isAdmin = userRole === 'admin'
    
    return {
      ...group,
      is_owner: isOwner,
      can_edit: isOwner || isEditor || isAdmin,
      file_count: group.upload_files?.[0]?.count || 0,
    }
  })

  const totalPages = count ? Math.ceil(count / perPage) : 1

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">
            Viewing {count || 0} collection{count !== 1 ? 's' : ''}
          </p>
        </div>
        {(userRole === 'uploader' || userRole === 'admin') && (
          <Button asChild>
            <Link href="/upload">Upload New</Link>
          </Button>
        )}
      </div>

      <FilesFilters 
        search={search}
        tag={tag}
        sort={sort}
        availableTags={allTags || []}
      />

      <FilesTable 
        groups={groupsWithAccess}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count || 0}
      />
    </div>
  )
}
