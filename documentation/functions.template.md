# Database Functions Template

This file serves as a template for documenting your PostgreSQL functions available through Supabase RPC interface.

## Purpose

Similar to other template files, this shows you what information should be documented in `functions.local.md`.

## Usage

1. Copy this file to create your local version:
   ```bash
   cp documentation/functions.template.md documentation/functions.local.md
   ```

2. Fill in `functions.local.md` with your actual database functions:
   - Public RPC functions callable by authenticated users
   - Service role functions for admin/testing
   - Internal helper functions used by RLS policies
   - Parameters, return types, and examples

3. Keep `functions.local.md` private (it's git-ignored)

## What to Document

### Public Functions
```
Function: get_example_data

Description: Fetches example data for display

Parameters:
- user_id (UUID) - The user to fetch data for
- limit (INTEGER, optional) - Max results to return

Returns: JSON array of objects

Call from JavaScript:
const { data, error } = await supabase.rpc('get_example_data', {
  user_id: userId,
  limit: 10
})

Permissions: Requires authentication
Security: SECURITY INVOKER (uses caller's permissions)
```

### Service Role Functions
```
Function: admin_cleanup_test_data

Description: Deletes test data (admin only)

Parameters:
- test_tag (TEXT) - Tag identifying test run

Returns: INTEGER (number of records deleted)

Note: Only callable with service role key
```

### Internal Functions
```
Function: is_authorized(resource_id)

Description: Helper for RLS policies

Returns: BOOLEAN
Usage: Used in policies, not for direct frontend use
```

---

**Note**: The local version (`functions.local.md`) is git-ignored to keep your function implementations private. This template stays in version control.

