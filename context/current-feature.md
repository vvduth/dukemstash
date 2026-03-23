# Current feature

## Status

In progress

## Goals

- Main content area with 4 stats cards (total items, collections, favorite items, favorite collections)
- Recent collections section
- Pinned items section
- 10 most recent items section

## Notes

See full spec: @context/features/dashboard-phase-3-spec.md
Reference screenshot: @context/screenshots/dashboard-ui-main.png
Data source: @src/lib/mock-data.js (imported directly until database is implemented)

## History
- **2026-03-20**: Initial Next.js 16 project setup with TypeScript, Tailwind CSS v4, and shadcn/ui. Project scaffolded via Create Next App.
- **2026-03-23**: Added mock data file at src/lib/mock-data.ts for dashboard UI development.
- **2026-03-23**: Dashboard UI Phase 1 complete. shadcn/ui initialized, /dashboard route created, dark mode set as default, TopBar with search and new item button, sidebar and main placeholders.
- **2026-03-23**: Dashboard UI Phase 2 complete. Collapsible sidebar with types navigation (links to /items/TYPE), favorite collections, recent collections, user avatar at bottom. Desktop: inline collapsible sidebar. Mobile: always a drawer with backdrop overlay.