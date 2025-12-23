# Development Guide

This guide will help you set up your environment and understand the project structure.

---

## Overview

This project is built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **Shadcn UI**.  
The goal is to keep the codebase modular, scalable, and easy to extend.

---

## Project Layout

We use a **colocation-based file system**. Each feature keeps its own pages, components, and logic.

```
src
├── app               # Next.js routes (App Router)
│   ├── (auth)        # Auth layouts & screens
│   ├── (app)         # Main app routes
│   │   ├── admin     # Admin dashboard
│   │   ├── files     # File collections
│   │   ├── roster    # Team members
│   │   ├── settings  # User settings
│   │   └── upload    # File upload
│   └── layout.tsx
├── components        # Shared UI components
├── hooks             # Reusable hooks
├── lib               # Config & utilities
├── styles            # Tailwind / theme setup
└── types             # TypeScript definitions
```

---

## Getting Started

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   ```

2. **Navigate into the Project**
   ```bash
   cd canary-desktop-cloud-frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials.

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   App will be available at [http://localhost:3000](http://localhost:3000).

---

## Development Workflow

- Always create a new branch before working on changes:
  ```bash
  git checkout -b feature/my-update
  ```

- Use clear commit messages:
  ```bash
  git commit -m "feat: add new feature"
  ```

- Open a Pull Request once ready.

---

## Project Structure

- **Auth Screens**: Login, register, and authentication layouts → `src/app/(auth)/`
- **App Screens**: Main application routes → `src/app/(app)/`
- **Components**: Reusable UI goes in `src/components/`
- **Hooks**: Custom logic goes in `src/hooks/`
- **Themes**: Presets under `src/styles/presets/`

---

## Guidelines

- Prefer **TypeScript types** over `any`
- Husky pre-commit hooks are enabled - linting and formatting run automatically when you commit
- Follow **Shadcn UI** style & Tailwind v4 conventions
- Keep accessibility in mind (ARIA, keyboard nav)
- Use clear commit messages with conventional prefixes (`feat:`, `fix:`, `chore:`, etc.)
- Avoid unnecessary dependencies — prefer existing utilities where possible
