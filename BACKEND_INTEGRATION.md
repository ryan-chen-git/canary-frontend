# Backend Integration Documentation

This document describes the Supabase backend integration for CANary Desktop Cloud.

## Database Schema

### profiles

User profiles with role-based access control.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, matches auth.users.id |
| `role` | ENUM | User role: `member`, `uploader`, or `admin` |
| `display_name` | TEXT | User's display name |
| `subteam` | TEXT | Team/subteam assignment |
| `graduation_year` | INTEGER | Graduation year (if applicable) |
| `status` | ENUM | Account status: `active` or `inactive` |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |

**Role Permissions:**
- **Member**: Read-only access to all groups and files
- **Uploader**: Can create groups, upload files, and manage own content
- **Admin**: Full system access including user management

### upload_groups

File collections with metadata and collaboration features.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `uploader_id` | UUID | Group owner (immutable, required for RLS) |
| `title` | TEXT | Group title (auto-generated if empty) |
| `notes` | TEXT | Optional description (searchable) |
| `tags` | TEXT[] | Array of tags (searchable) |
| `editors` | UUID[] | User IDs with edit permissions |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `files_updated_at` | TIMESTAMPTZ | Last file modification time |
| `last_edited_at` | TIMESTAMPTZ | Last metadata edit time |
| `last_edited_by` | UUID | User who last edited metadata |

### upload_files

Individual files within groups.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `group_id` | UUID | Foreign key to upload_groups (CASCADE delete) |
| `original_filename` | TEXT | Original uploaded filename |
| `file_type` | TEXT | File extension (e.g., "blf", "csv") |
| `content_type` | TEXT | MIME type |
| `size_bytes` | BIGINT | File size in bytes |
| `storage_path` | TEXT | Storage location: `raw/{uuid}` |
| `position` | INTEGER | Sort order within group |
| `created_at` | TIMESTAMPTZ | Upload timestamp |

## Storage Configuration

### Buckets

- **uploads**: Primary storage bucket for new files
- **can-logs**: Legacy bucket (maintained for backwards compatibility)

### Access Control

- All authenticated users can download files via signed URLs
- Only users with `uploader` or `admin` roles can upload
- File deletion restricted to owners, editors, and admins

### File Downloads

Files are accessed through signed URLs with 1-hour expiration:
```typescript
const { data, error } = await supabase.storage
  .from('uploads')
  .createSignedUrl(file.storage_path, 3600)
```

## Row Level Security (RLS)

All authorization is enforced at the database level through RLS policies. The frontend makes standard Supabase queries, and policies automatically apply based on:

- Authenticated user's role
- Group ownership (`uploader_id`)
- Editor permissions (`editors` array)

### RLS Helper Functions

- `is_admin()`: Check if current user is admin
- `is_uploader()`: Check if current user is uploader or admin
- `is_group_editor(group_id)`: Check if user is in editors array
- `is_group_owner(group_id)`: Check if user owns the group
- `can_edit_group(group_id)`: Check if user can edit (owner, editor, or admin)

## Frontend Implementation

### Route Structure

```
/                      → Redirects to /logs
/login                 → Authentication
/signup                → User registration
/logs                  → File groups listing
/logs/[id]            → Group detail view
/logs/[id]/edit       → Edit group metadata
/upload               → Multi-file upload
/roster               → Team members list
/admin                → Admin dashboard
/settings             → User profile
```

### Implemented Features

#### Authentication
- Server-side session validation with `@supabase/ssr`
- Cookie-based sessions for security
- Protected routes with automatic redirects
- Logout with session cleanup

#### File Management
- Multi-file upload with progress tracking
- Search by title and notes (case-insensitive)
- Tag filtering with dynamic tag discovery
- Sorting by creation date, update date, or title
- Pagination with 20 items per page
- Secure downloads with signed URLs

#### Collaboration
- Role-based UI elements (upload button visibility)
- Access indicators (read-only badges)
- Editor management for shared groups
- Owner-only operations (delete, editor management)

#### User Management
- Team roster with role badges
- Admin dashboard with system statistics
- User profile display

### Data Fetching Patterns

All data queries use the async server client:

```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
const { data, error } = await supabase
  .from('upload_groups')
  .select('*')
  .eq('id', groupId)
```

### Future Enhancements

- File reordering with drag-and-drop
- Bulk operations in admin panel
- Storage usage tracking and quotas
- Advanced search with filters
- Activity logs and audit trails
- File preview capabilities

## Environment Setup

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Obtain these from [Supabase Dashboard](https://app.supabase.com) → Project Settings → API.

## Security Considerations

- All sensitive operations require authentication
- RLS policies enforce authorization at database level
- Sessions stored in HTTP-only cookies
- Signed URLs prevent unauthorized file access
- ANON_KEY safe for client-side use (RLS enforced)
- No direct database credentials in frontend code
