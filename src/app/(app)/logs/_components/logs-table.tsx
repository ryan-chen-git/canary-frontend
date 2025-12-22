'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import type { UploadGroupWithAccess } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Lock } from 'lucide-react'

interface LogsTableProps {
  groups: UploadGroupWithAccess[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function LogsTable({ groups, currentPage, totalPages, totalCount }: LogsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`/logs?${params.toString()}`)
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No logs found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchParams.toString() ? 'Try adjusting your filters' : 'Upload some data to get started'}
          </p>
          <Button asChild>
            <Link href="/upload">Upload New</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Title
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Tags
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Files
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Created
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/logs/${group.id}`} className="font-medium hover:underline">
                      {group.title}
                    </Link>
                    {!group.can_edit && (
                      <span title="Read-only access">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </span>
                    )}
                  </div>
                  {group.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {group.notes}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {group.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {group.file_count || 0} file{group.file_count !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/logs/${group.id}`}>View</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, totalCount)} of {totalCount} results
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
