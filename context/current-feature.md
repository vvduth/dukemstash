# Current Feature: Auth Credentials - Email/Password Provider

## Status

In Progress

## Goals

- Add Credentials provider for email/password authentication
- Create registration API route at `/api/auth/register` (name, email, password, confirmPassword)
- Update `auth.config.ts` with Credentials provider placeholder (`authorize: () => null`)
- Update `auth.ts` to override Credentials with bcrypt validation
- Validate passwords match, check duplicate users, hash with bcryptjs
- Ensure GitHub OAuth continues to work

## Requirements

- Use bcryptjs for hashing (already installed)
- Add password field to User model via migration if not already there
- Registration: validate passwords match, check existing user, hash password, create user
- Return `{ success, data, error }` pattern from registration endpoint

## References

- Spec: `context/features/auth-phase-2-spec.md`
- Credentials provider docs: https://authjs.dev/getting-started/authentication/credentials

## Notes

### Split Auth Pattern
- `auth.config.ts`: Add Credentials provider with `authorize: () => null` placeholder (used by proxy/middleware)
- `auth.ts`: Override the Credentials provider with actual bcrypt validation logic (used server-side)

### Testing
1. Test registration via curl POST to `/api/auth/register`
2. Sign in at `/api/auth/signin` with email/password
3. Verify redirect to `/dashboard`
4. Verify GitHub OAuth still works

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
- **2026-03-24**: Auth Phase 1 complete. NextAuth v5 (beta) with GitHub OAuth, Prisma adapter, JWT sessions, split auth config pattern. Next.js 16 proxy protects /dashboard/* routes. Two-layer auth: proxy redirect + layout guard. Dashboard layout uses real session instead of findFirst() hack.