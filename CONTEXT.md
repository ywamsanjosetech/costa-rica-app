# CONTEXT

## Project Info
- Project Name: YWAM Housing Assessment
- Client: YWAM San José Costa Rica
- Environment: dev

## Tech Stack
- Framework: Next.js (App Router)
- Language: JavaScript
- Database: PostgreSQL (Supabase)
- ORM / Client: Supabase JS
- Hosting: Vercel

## Architecture Rules
- Primary routing: App Router
- Preferred patterns: Server Components by default, client components only when needed
- API routes for secure DB operations
- What to avoid: Exposing secrets, fat client components
- Refactor policy: Small incremental changes only

## Naming Conventions
- Components: PascalCase
- Utilities: camelCase
- Files: kebab-case
- Env vars: UPPER_SNAKE_CASE

## DO NOT TOUCH
- `/.env`
- `/.env.local`
- `/next.config.*`

## Current Focus
- Feature: Project scaffolding + DB design
- Scope: Foundation only

## Notes
- Context reset threshold: 50%
- Session rules: Always confirm before major changes
