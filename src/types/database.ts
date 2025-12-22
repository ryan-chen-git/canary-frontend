// Profile types
export interface Profile {
  id: string
  role: 'member' | 'uploader' | 'admin'
  display_name: string | null
  subteam: string | null
  graduation_year: number | null
  status: string | null
}

// Upload group types
export interface UploadGroup {
  id: string
  uploader_id: string
  title: string
  notes: string | null
  tags: string[] | null
  editors: string[] | null
  created_at: string
  files_updated_at: string | null
  last_edited_at: string | null
  last_edited_by: string | null
}

// Upload file types
export interface UploadFile {
  id: string
  group_id: string
  original_filename: string
  file_type: string | null
  content_type: string | null
  size_bytes: number
  storage_path: string
  position: number
  created_at: string
}

// Extended types for UI
export interface UploadGroupWithFiles extends UploadGroup {
  upload_files: UploadFile[]
  file_count?: number
}

export interface UploadGroupWithAccess extends UploadGroup {
  is_owner: boolean
  can_edit: boolean
  file_count?: number
  uploader_profile?: Profile
}

// Helper type for counting
export interface FileCount {
  count: number
}
