# Current feature

## Status



## Goals

## Notes

## History
- **2026-03-23**: Prisma 7 + Neon PostgreSQL setup complete. Schema with all models, initial migration, seed script, PrismaPg driver adapter, singleton client, and test script.
- **2026-03-20**: Initial Next.js 16 project setup with TypeScript, Tailwind CSS v4, and shadcn/ui. Project scaffolded via Create Next App.
- **2026-03-23**: Added mock data file at src/lib/mock-data.ts for dashboard UI development.
- **2026-03-23**: Dashboard UI Phase 1 complete. shadcn/ui initialized, /dashboard route created, dark mode set as default, TopBar with search and new item button, sidebar and main placeholders.
- **2026-03-23**: Dashboard UI Phase 2 complete. Collapsible sidebar with types navigation (links to /items/TYPE), favorite collections, recent collections, user avatar at bottom. Desktop: inline collapsible sidebar. Mobile: always a drawer with backdrop overlay.
- **2026-03-23**: Dashboard UI Phase 3 complete. Main content area with 4 stats cards, recent collections grid, pinned items section, and recent items grid. StatsCards, CollectionCard, and ItemCard components created.

- **2026-03-23**: Seed data complete. Demo user, 7 system types, 5 collections, 18 items, 30 tags with all relationships. Idempotent seed script with bcryptjs password hashing. Updated test-db script to verify all seeded data.
