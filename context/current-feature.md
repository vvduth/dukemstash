# Current feature

## Status
In progress

## Goals
- Set up Prisma 7 ORM with Neon PostgreSQL (serverless)
- Create initial schema based on data models in project-overview.md
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Use migrations (never `db push`) — dev branch in DATABASE_URL, production branch separate
- Seed system item types

## Notes
- Must use Prisma 7 (has breaking changes from v6 — read upgrade guide)
- Neon PostgreSQL serverless setup
- Always create migrations, never push directly unless specified
- Two database branches: development (DATABASE_URL) and production

## History
- **2026-03-20**: Initial Next.js 16 project setup with TypeScript, Tailwind CSS v4, and shadcn/ui. Project scaffolded via Create Next App.
- **2026-03-23**: Added mock data file at src/lib/mock-data.ts for dashboard UI development.
- **2026-03-23**: Dashboard UI Phase 1 complete. shadcn/ui initialized, /dashboard route created, dark mode set as default, TopBar with search and new item button, sidebar and main placeholders.
- **2026-03-23**: Dashboard UI Phase 2 complete. Collapsible sidebar with types navigation (links to /items/TYPE), favorite collections, recent collections, user avatar at bottom. Desktop: inline collapsible sidebar. Mobile: always a drawer with backdrop overlay.
- **2026-03-23**: Dashboard UI Phase 3 complete. Main content area with 4 stats cards, recent collections grid, pinned items section, and recent items grid. StatsCards, CollectionCard, and ItemCard components created.