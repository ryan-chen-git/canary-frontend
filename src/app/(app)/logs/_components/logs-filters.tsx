'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTransition } from 'react'

interface LogsFiltersProps {
  search: string
  tag: string
  sort: string
  availableTags: string[]
}

export function LogsFilters({ search, tag, sort, availableTags }: LogsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to page 1 when filters change
    params.delete('page')
    
    startTransition(() => {
      router.push(`/logs?${params.toString()}`)
    })
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          type="text"
          placeholder="Search logs..."
          defaultValue={search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="max-w-sm"
          disabled={isPending}
        />
        
        <Select value={tag || 'all'} onValueChange={(value) => updateFilter('tag', value === 'all' ? '' : value)}>
          <SelectTrigger className="w-full sm:w-[180px]" disabled={isPending}>
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {availableTags.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => updateFilter('sort', value)}>
          <SelectTrigger className="w-full sm:w-[180px]" disabled={isPending}>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="updated">Recently Updated</SelectItem>
            <SelectItem value="title">By Title</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
