# Backend Integration

This frontend connects to an existing Supabase backend with the following schema:

## Database Tables

### `profiles`
- User profiles with roles: `member`, `uploader`, `admin`
- Fields: `id`, `role`, `display_name`, `subteam`, `graduation_year`, `status`
- Members can view all groups but cannot create/upload
- Uploaders and admins can create groups and upload files

### `upload_groups`
- Collections of uploaded files
- Fields:
  - `id`: UUID (primary key)
  - `uploader_id`: UUID (owner, immutable)
  - `title`: TEXT (required, auto-filled if blank)
  - `notes`: TEXT (optional, searchable)
  - `tags`: TEXT[] (searchable array)
  - `editors`: UUID[] (users with edit permission)
  - `created_at`, `files_updated_at`, `last_edited_at`, `last_edited_by`

### `upload_files`
- Individual files within groups
- Fields:
  - `id`: UUID (primary key)
  - `group_id`: UUID (foreign key, CASCADE delete)
  - `original_filename`: TEXT
  - `file_type`: TEXT (e.g., "blf", "csv", "log")
  - `content_type`: TEXT (MIME type)
  - `size_bytes`: BIGINT
  - `storage_path`: TEXT (format: `raw/{uuid}`)
  - `position`: INTEGER (sort order)
  - `created_at`: TIMESTAMPTZ

## Storage Buckets

- **uploads**: Primary bucket for new files
- **can-logs**: Legacy bucket (still accessible)
- All authenticated users can download files
- Only uploaders/admins can upload/delete

## Access Control

Authorization is enforced by Supabase Row Level Security (RLS):

- **Members**: Can view all groups and download files (read-only)
- **Uploaders**: Can create groups, upload files, manage own content
- **Admins**: Full access to all operations
- **Editors**: Users in the `editors` array can edit group metadata and files but cannot modify the editors list or delete the group

The frontend uses standard Supabase queries - RLS policies automatically enforce permissions based on the authenticated user's role and relationship to each group.

## Frontend Implementation

### Pages
- `/logs` - List all upload groups with search, filter, sort, pagination
- `/logs/[id]` - View group details with file listings and download links
- `/logs/[id]/edit` - Edit group metadata (owners/editors/admins only)
- `/upload` - Upload new files (uploaders/admins only)

### Features Implemented
✅ Server-side authentication with cookie-based sessions
✅ Role-based UI (upload button only for uploaders/admins)
✅ Real-time search on title/notes fields
✅ Tag filtering with dynamic tag discovery
✅ Sorting by date, last updated, or title
✅ Pagination with URL query parameters
✅ Signed download URLs (1 hour expiry)
✅ Access indicators (read-only badge for non-editors)
✅ File count and metadata display

### Next Steps
- Upload form with multi-file handling
- Group metadata editing (title, notes, tags, editors)
- File reordering (drag-and-drop position updates)
- Editor management UI
- Delete operations (owners only)
