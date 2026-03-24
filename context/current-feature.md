# Current feature

## Status

In Progress

## Goals

Quick-win code quality and performance fixes identified by codebase scan. Low risk, no auth changes.

## Requirements

### 1. Fix N+1 over-fetching in collection queries (HIGH)
- `getRecentCollections` and `getSidebarRecentCollections` in `src/lib/db/collections.ts` load ALL items per collection just to compute a dominant color
- Extract a shared `computeDominantColor()` helper to eliminate duplicated logic
- Add a `take` limit on the items include so we don't load unlimited items for a color computation
- Use Prisma conventions only (no raw SQL)
- Create a Prisma migration for any new indexes needed (must sync across dev and prod)

### 2. Validate DATABASE_URL at startup (HIGH)
- `src/lib/prisma.ts` passes `process.env.DATABASE_URL` to `PrismaPg` without a null check
- Add an explicit check that throws a clear error if the env var is missing

### 3. Extract shared ICON_MAP constant (MEDIUM)
- `ICON_MAP` is duplicated across `Sidebar.tsx`, `CollectionCard.tsx`, and `ItemCard.tsx`
- Move to `src/lib/constants/icon-map.ts` and import from there

### 4. Fix weak typing in StatsCards (MEDIUM)
- `StatsCards.tsx` uses `Record<string, number>` for value lookup — key mismatch silently returns `undefined`
- Use a properly typed map keyed off actual stat keys

### 5. Add Escape key handler to mobile sidebar (MEDIUM)
- Mobile drawer in `Sidebar.tsx` has no keyboard dismiss — add `Escape` key listener

### 6. Add aria-label to search input (LOW)
- Search input in `TopBar.tsx` is decorative but missing `aria-label` for accessibility

### 7. Move bcryptjs to production dependencies (LOW)
- `bcryptjs` is in `devDependencies` but needed at runtime for seed and future auth

## References

- Codebase scan report (2026-03-24)

## Notes

- Skipped auth-related items (not implemented yet)
- Skipped schema changes (defaultTypeId) — separate feature
- Skipped seed script changes (low value, some risk)
- Keeping mock-data.ts as-is
- N+1 fix must use Prisma only (no raw SQL), with a migration for any new indexes

## History
- **2026-03-23**: Prisma 7 + Neon PostgreSQL setup complete. Schema with all models, initial migration, seed script, PrismaPg driver adapter, singleton client, and test script.
- **2026-03-20**: Initial Next.js 16 project setup with TypeScript, Tailwind CSS v4, and shadcn/ui. Project scaffolded via Create Next App.
- **2026-03-23**: Added mock data file at src/lib/mock-data.ts for dashboard UI development.
- **2026-03-23**: Dashboard UI Phase 1 complete. shadcn/ui initialized, /dashboard route created, dark mode set as default, TopBar with search and new item button, sidebar and main placeholders.
- **2026-03-23**: Dashboard UI Phase 2 complete. Collapsible sidebar with types navigation (links to /items/TYPE), favorite collections, recent collections, user avatar at bottom. Desktop: inline collapsible sidebar. Mobile: always a drawer with backdrop overlay.
- **2026-03-23**: Dashboard UI Phase 3 complete. Main content area with 4 stats cards, recent collections grid, pinned items section, and recent items grid. StatsCards, CollectionCard, and ItemCard components created.

- **2026-03-23**: Seed data complete. Demo user, 7 system types, 5 collections, 18 items, 30 tags with all relationships. Idempotent seed script with bcryptjs password hashing. Updated test-db script to verify all seeded data.
- **2026-03-23**: Dashboard Collections feature complete. Replaced mock collection data with real Prisma DB queries. Created src/lib/db/collections.ts, updated CollectionCard with dominant type border color, collection stats from DB. Dashboard is now dynamically rendered.
- **2026-03-23**: Dashboard Items feature complete. Replaced mock item data with real Prisma DB queries. Created src/lib/db/items.ts with getRecentItems, getPinnedItems, getItemStats. Updated ItemCard to receive type data directly. All DB calls parallelized with Promise.all. Wired up Geist font variables in globals.css.
- **2026-03-23**: Stats & Sidebar feature complete. Sidebar now uses real DB data for item types, favorite collections, and recent collections. Added getSystemItemTypes, getFavoriteCollections, getSidebarRecentCollections DB functions. Recent collections show colored circle based on dominant item type. Added "View all collections" link. Layout fetches sidebar data server-side with Promise.all.
- **2026-03-24**: PRO badge added to sidebar. Added shadcn/ui Badge component next to "files" and "images" types in sidebar navigation to indicate Pro-only item types. Subtle secondary variant badge with uppercase "PRO" text.