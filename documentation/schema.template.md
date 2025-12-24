# Database Schema Template

This file serves as a template for documenting your database schema, including table structures, field types, constraints, and validation rules.

## Purpose

Similar to `db_functions.template.md`, this file shows you what information should be documented in `schema.local.md`.

## Usage

1. Copy this file to create your local version:
   ```bash
   cp documentation/schema.template.md documentation/schema.local.md
   ```

2. Fill in `schema.local.md` with your actual database schema:
   - Table definitions with columns and types
   - Primary and foreign key relationships
   - Constraints and validation rules
   - Valid enum/option values
   - Indexes for performance
   - Storage bucket configurations

3. Keep `schema.local.md` private (it's git-ignored)

## What to Document

### Table Structure
```
Table: example_table
- id (UUID, primary key, not null)
- name (TEXT, not null)
- category (TEXT, nullable, default: null)
- created_at (TIMESTAMPTZ, not null, default: now())

Foreign Keys:
- user_id → profiles(id) ON DELETE CASCADE
```

### Valid Values
```
Field: status
Options:
- active
- inactive
- pending
```

### Constraints
```
Trigger: validate_email_format()
Rule: Email must match pattern
Error: "Invalid email format"
```

### Indexes
```
Table: example_table
- Primary key on id
- Index on (user_id, created_at)
- GIN index on tags array
```

---

**Note**: The local version (`schema.local.md`) is git-ignored to keep your specific schema details private. This template stays in version control.

