# Developer Guide

Welcome to the CANary Desktop Cloud Frontend. This guide will help you set up your development environment and understand how the project integrates with the backend database.

---

## Overview

This is a modern full-stack web application built with:
- **Next.js 15** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Shadcn UI** for component library
- **Supabase** for backend (PostgreSQL + Auth + Storage)

The frontend communicates with Supabase using the JavaScript SDK, with all authorization handled by Row Level Security (RLS) policies on the database side.

---

## Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd canary-desktop-cloud-frontend

# Install dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from [Supabase Dashboard](https://app.supabase.com) → Project Settings → API.

### 4. Database Functions Reference

```bash
# Copy database functions template (optional but recommended)
cp documentation/db_functions.template.md documentation/db_functions.local.md
```

Fill in `documentation/db_functions.local.md` with your actual database functions, RLS policies, and schema details. This file is git-ignored for security.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

The project uses a **colocation-based architecture** where features are self-contained with their own pages, components, and logic.

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes (login, signup)
│   ├── (app)/             # Main application routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── files/         # File management
│   │   ├── members/       # Team roster
│   │   ├── settings/      # User profile settings
│   │   └── upload/        # File upload
│   └── layout.tsx         # Root layout
├── components/            # Shared UI components
│   └── ui/               # Shadcn UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configuration
│   ├── supabase.ts       # Browser Supabase client
│   ├── supabase-server.ts # Server Supabase client
│   └── utils.ts          # Helper functions
├── styles/               # Global styles and Tailwind config
└── types/                # TypeScript type definitions
```

### Route Groups

- **(auth)**: Layout for unauthenticated pages (login, signup)
- **(app)**: Layout for authenticated pages with navigation

### Component Organization

- **Server Components**: Default for data fetching (pages, layouts)
- **Client Components**: Marked with `'use client'` for interactivity
- **_components folders**: Feature-specific components live next to their routes

---

## Backend Integration

### Architecture

This frontend connects to a Supabase backend which provides:
- **PostgreSQL Database**: Tables with Row Level Security (RLS)
- **Authentication**: Session management with cookies
- **Storage**: File uploads with signed URLs
- **RPC Functions**: Database functions callable from frontend

All authorization happens at the database level through RLS policies. The frontend makes standard queries, and the database enforces permissions based on the authenticated user's role.

### Supabase Clients

**Browser Client** (`@/lib/supabase`):
```typescript
import { createClient } from '@/lib/supabase'

// Use in Client Components
const supabase = createClient()
const { data } = await supabase.from('table').select('*')
```

**Server Client** (`@/lib/supabase-server`):
```typescript
import { createClient } from '@/lib/supabase-server'

// Use in Server Components, Server Actions, Route Handlers
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Database Schema

The application uses three main tables:

**profiles** - User accounts with role-based access
- Roles: `member` (read-only), `uploader` (can create), `admin` (full access)
- Fields: `display_name`, `subteam`, `graduation_year`, `role`, `status`

**upload_groups** - File collections with metadata
- Owner-based permissions with optional editors
- Fields: `title`, `notes`, `tags`, `editors`, `uploader_id`
- Timestamps: `created_at`, `files_updated_at`, `last_edited_at`

**upload_files** - Individual files within groups
- Cascade deletes when parent group is deleted
- Fields: `original_filename`, `file_type`, `size_bytes`, `storage_path`

### RPC Functions

Database functions are called using `.rpc()`:

```typescript
// Example: Get all admin statistics in one call
const { data: stats } = await supabase.rpc('get_admin_stats')

// Example: Get unique tags
const { data: tags } = await supabase.rpc('get_unique_tags')
```

See `documentation/db_functions.local.md` (if you created it) for the complete list of available functions, or check your Supabase Dashboard → Database → Functions.

### File Storage

Files are stored in Supabase Storage buckets:

**Upload**:
```typescript
const { data, error } = await supabase.storage
  .from('uploads')
  .upload(`raw/${uuid}`, file)
```

**Download** (signed URLs):
```typescript
const { data } = await supabase.storage
  .from('uploads')
  .createSignedUrl(file.storage_path, 3600) // 1 hour expiration
```

### Authentication Flow

**Protected Routes**:
- Layout at `src/app/(app)/layout.tsx` checks auth on server
- Redirects to `/login` if no valid session
- Session stored in HTTP-only cookies

**Login**:
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

**Logout**:
```typescript
await supabase.auth.signOut()
```

---

## Development Workflow

### Branching Strategy

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
```

### Commit Conventions

Use conventional commit prefixes:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Pre-commit Hooks

Husky runs automatically on commit:
- Linting with ESLint
- Code formatting with Prettier
- Type checking with TypeScript

### Type Safety

Always define proper TypeScript types:

```typescript
// Good
interface User {
  id: string
  email: string
  role: 'member' | 'uploader' | 'admin'
}

// Bad
const user: any = { ... }
```

---

## Key Features

### Data Fetching

Server Components fetch data directly:
```typescript
export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('upload_groups')
    .select('*')
    .order('created_at', { ascending: false })

  return <div>{/* render data */}</div>
}
```

### Search & Filtering

```typescript
// Text search (case-insensitive)
.ilike('title', `%${query}%`)

// Tag filtering
.contains('tags', [selectedTag])

// Sorting
.order('created_at', { ascending: false })
```

### Pagination

```typescript
const ITEMS_PER_PAGE = 20
const start = (page - 1) * ITEMS_PER_PAGE
const end = start + ITEMS_PER_PAGE - 1

const { data, count } = await supabase
  .from('table')
  .select('*', { count: 'exact' })
  .range(start, end)
```

### Role-Based UI

```typescript
// Show upload button only for uploaders/admins
{(profile.role === 'uploader' || profile.role === 'admin') && (
  <Button>Upload Files</Button>
)}
```

---

## Common Tasks

### Adding a New Page

1. Create route folder: `src/app/(app)/my-page/`
2. Add `page.tsx`:
```typescript
export default async function MyPage() {
  return <div>My Page</div>
}
```
3. Update navigation in `src/app/(app)/layout.tsx` if needed

### Creating a Client Component

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function MyComponent() {
  const [count, setCount] = useState(0)
  
  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  )
}
```

### Adding a New Database Table

1. Create table in Supabase Dashboard → Database → Tables
2. Set up RLS policies
3. Add TypeScript types in `src/types/database.ts`
4. Query from frontend using Supabase client

### Calling a New RPC Function

1. Create function in Supabase Dashboard → Database → Functions
2. Call from frontend:
```typescript
const { data, error } = await supabase.rpc('my_function', {
  param1: 'value1',
  param2: 'value2'
})
```

---

## Troubleshooting

### "Invalid session" errors
- Check if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Verify session cookies are being set (check browser DevTools → Application → Cookies)
- Try logging out and logging back in

### "Permission denied" errors
- RLS policies are enforced at database level
- Check user's role in `profiles` table
- Review RLS policies in Supabase Dashboard → Authentication → Policies

### File upload failures
- Check storage bucket permissions (RLS)
- Verify file size limits
- Ensure correct bucket name (`uploads`)

### Type errors with Supabase queries
- Regenerate types: `npm run supabase:types` (if configured)
- Add manual type assertions: `as MyType`

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler

# Database (if supabase CLI configured)
supabase db reset        # Reset local database
supabase db push         # Push migrations
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Project Conventions

- Use TypeScript for all new code
- Follow existing patterns for consistency
- Keep components small and focused
- Prefer server components over client components when possible
- Write descriptive commit messages
- Test changes locally before pushing
- Keep accessibility in mind (semantic HTML, ARIA attributes, keyboard navigation)

