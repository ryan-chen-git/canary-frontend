# Database Functions Template

This file serves as a template for documenting your database functions, RLS policies, schema, and backend integration details.

## Purpose

Similar to how `.env.example` provides a template for environment variables, this file shows you what information should be documented in `db_functions.local.md`.

## Usage

1. Copy this file to create your local version:
   ```bash
   cp documentation/db_functions.template.md documentation/db_functions.local.md
   ```

2. Fill in `db_functions.local.md` with your actual database details:
   - Available RPC functions and their parameters
   - Row Level Security (RLS) policies
   - Database schema (tables, columns, types)
   - Helper functions and triggers
   - Testing documentation

3. Keep `db_functions.local.md` private (it's git-ignored)

## What to Document

### RPC Functions
List all database functions callable from the frontend:
```
Function Name: get_example_data
Parameters: user_id (UUID), limit (INTEGER)
Returns: JSON array
Description: Fetches example data for a user
Security: SECURITY INVOKER (uses caller's permissions)
```

### RLS Policies
Document access control rules:
```
Table: profiles
Policy: profiles_select_own
Type: SELECT
Who: Authenticated users
Logic: Can view their own profile only
```

### Database Schema
Document table structures:
```
Table: example_table
- id (UUID, primary key)
- name (TEXT, not null)
- created_at (TIMESTAMPTZ, default now())
```

### Helper Functions
Document internal functions used by RLS policies:
```
Function: is_admin()
Returns: BOOLEAN
Purpose: Check if current user has admin role
```

---

**Note**: The local version (`db_functions.local.md`) is git-ignored to keep your specific implementation details private. This template stays in version control to help other developers know what to document.

