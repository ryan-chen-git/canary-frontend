<div align="center">
  <h1>CANary Desktop Cloud</h1>
  <p><strong>Modern File Management & Collaboration Platform</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#documentation">Documentation</a>
  </p>
  
  ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
  ![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase)
  ![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
</div>

---

## Overview

CANary Desktop Cloud is a modern, secure file management and collaboration platform built for internal team use. It features role-based access control, real-time file uploads, and a beautiful, responsive interface powered by Next.js 16 and Supabase.

## Features

### Authentication & Security
- Secure email/password authentication with Supabase
- Cookie-based SSR sessions for enhanced security
- Row Level Security (RLS) enforced at database level
- Protected routes with automatic redirects

### File Management
- Multi-file upload with real-time progress tracking
- Organized file groups with metadata (title, notes, tags)
- Secure file downloads with signed URLs
- Search, filter, and sort capabilities
- Collaborative editing with owner and editor roles

### Team Management
- User roster with role assignments (Member, Uploader, Admin)
- Team member profiles with subteam and graduation year
- Admin dashboard with system statistics
- User account settings and preferences

### Modern UI/UX
- Responsive design with Tailwind CSS v4
- Beautiful component library with shadcn/ui
- Light/dark mode with multiple theme presets
- Intuitive navigation with collapsible sidebar
- Real-time data updates

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ryan-chen-git/CANary-desktop-cloud-frontend.git
   cd CANary-desktop-cloud-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   
   > **Note:** Get these values from [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui, Radix UI |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **State Management** | Zustand, React Hook Form |
| **Data Tables** | TanStack Table |
| **Validation** | Zod |
| **Code Quality** | Biome, ESLint, Husky |

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (app)/               # Protected application pages
│   │   ├── logs/            # File management
│   │   ├── upload/          # File upload interface
│   │   ├── roster/          # Team member roster
│   │   ├── admin/           # Admin dashboard
│   │   └── settings/        # User settings
│   └── actions/             # Server actions
├── components/              # Reusable UI components
├── lib/
│   ├── supabase.ts         # Browser client
│   └── supabase-server.ts  # Server client (SSR)
├── types/
│   └── database.ts         # TypeScript types
└── navigation/             # Navigation configuration
```

## Key Features Explained

### Role-Based Access Control

- **Member**: Read-only access to files
- **Uploader**: Can create and manage own file groups
- **Admin**: Full system access including user management

### Collaborative File Groups

- Group owners can add editors for collaborative access
- Editors can modify group metadata and files
- Fine-grained permissions via RLS policies

### Secure File Storage

- Files stored in Supabase Storage buckets
- Signed URLs for secure, time-limited downloads
- Automatic file type detection and validation

## Documentation

- [Backend Integration Guide](BACKEND_INTEGRATION.md) - Database schema and RLS policies
- [Environment Setup](.env.example) - Required environment variables
- [Supabase Documentation](https://supabase.com/docs) - Backend platform docs

## Security

- Server-side authentication with `@supabase/ssr`
- HTTP-only cookies for session management
- Row Level Security (RLS) on all database tables
- Secure file storage with signed URLs
- Environment variables for sensitive credentials

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

Built with the [Studio Admin](https://github.com/arhamkhnz/next-shadcn-admin-dashboard) template.

---

<div align="center">
  Made with care for internal team collaboration
</div>
