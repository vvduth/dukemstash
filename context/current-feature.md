# Current Feature: Auth Setup - NextAuth + GitHub Provider

## Status

In Progress

## Goals

- Install NextAuth v5 (`next-auth@beta`) and `@auth/prisma-adapter`
- Set up split auth config pattern for edge compatibility
- Add GitHub OAuth provider
- Protect `/dashboard/*` routes using Next.js 16 proxy
- Redirect unauthenticated users to sign-in

## Requirements

### Files to Create
1. `src/auth.config.ts` - Edge-compatible config (providers only, no adapter)
2. `src/auth.ts` - Full config with Prisma adapter and JWT strategy
3. `src/app/api/auth/[...nextauth]/route.ts` - Export handlers from auth.ts
4. `src/proxy.ts` - Route protection with redirect logic
5. `src/types/next-auth.d.ts` - Extend Session type with user.id

### Environment Variables
- `AUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`

## References

- Spec: context/features/auth-phase-1-spec.md
- Edge compatibility: https://authjs.dev/getting-started/installation#edge-compatibility
- Prisma adapter: https://authjs.dev/getting-started/adapters/prisma

## Notes

- Use `next-auth@beta` (not `@latest` which installs v4)
- Proxy file must be at `src/proxy.ts` (same level as `app/`)
- Use named export: `export const proxy = auth(...)` not default export
- Use `session: { strategy: 'jwt' }` with split config pattern
- Don't set custom `pages.signIn` - use NextAuth's default page
- Use Context7 to verify newest config and conventions

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
- **2026-03-24**: Codebase quick wins complete. Fixed N+1 over-fetching in collection queries (shared computeDominantTypes helper, take:50 limit, collectionId index migration). Validated DATABASE_URL at startup. Extracted shared ICON_MAP to src/lib/constants/icon-map.ts. Fixed weak typing in StatsCards. Added Escape key handler to mobile sidebar. Added aria-label to search input. Moved bcryptjs to production dependencies.