'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTransition, useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'

interface LogsFiltersProps {
  search: string
  tag: string
  sort: string
  availableTags: string[]
}

export function FilesFilters({ search, tag, sort, availableTags }: LogsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(search)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update local state when URL search param changes
  useEffect(() => {
    setSearchInput(search)
  }, [search])

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
      router.push(`/files?${params.toString()}`)
    })
  }

  const handleSearch = (value: string) => {
    setShowSuggestions(false)
    updateFilter('search', value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(searchInput)
      inputRef.current?.blur()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search files... (press Enter)"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => searchInput && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-9"
            disabled={isPending}
          />
          {showSuggestions && searchInput && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border bg-popover p-2 shadow-md">
              <div className="text-xs text-muted-foreground px-2 py-1">
                Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Enter</kbd> to search for "{searchInput}"
              </div>
            </div>
          )}
        </div>
        
        <Select 
          value={tag || 'all'} 
          onValueChange={(value) => updateFilter('tag', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]" disabled={isPending}>
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">All Tags</SelectItem>
            {availableTags.length > 0 && availableTags.map((t) => (
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
