# RLS Policies Template

This file serves as a template for documenting your Row Level Security (RLS) policies.

## Purpose

Similar to other template files, this shows you what information should be documented in `policies.local.md`.

## Usage

1. Copy this file to create your local version:
   ```bash
   cp documentation/policies.template.md documentation/policies.local.md
   ```

2. Fill in `policies.local.md` with your actual RLS policies:
   - Policies for each table (SELECT, INSERT, UPDATE, DELETE)
   - Who can access what
   - Policy logic and conditions
   - Helper functions used by policies
   - Triggers for validation

3. Keep `policies.local.md` private (it's git-ignored)

## What to Document

### Table Policies
```
Table: example_table
RLS: Enabled

Policies:

1. example_table_select_own (SELECT)
   - Who: Authenticated users
   - Access: Can view their own records only
   - Logic: auth.uid() = user_id

2. example_table_insert_authorized (INSERT)
   - Who: Users with 'editor' role
   - Access: Can create new records
   - Logic: is_editor() OR is_admin()
```

### Helper Functions
```
Function: is_editor()
Returns: BOOLEAN
Logic: Checks if auth.uid() has role = 'editor'
Flags: SECURITY DEFINER, row_security = off
```

### Triggers
```
Trigger: validate_before_insert
Function: check_user_permissions()
When: BEFORE INSERT
Purpose: Validates user has permission to create record
```

### Role Summary Table
```
| Operation          | User | Editor | Admin |
|--------------------|------|--------|-------|
| View all records   | No   | Yes    | Yes   |
| Create records     | No   | Yes    | Yes   |
| Update own records | Yes  | Yes    | Yes   |
| Delete records     | No   | No     | Yes   |
```

---

**Note**: The local version (`policies.local.md`) is git-ignored to keep your policy details private. This template stays in version control.

