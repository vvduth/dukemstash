# Current Feature: Auth UI - Sign In, Register & Sign Out

## Status

In Progress

## Goals

- Custom sign-in page at `/sign-in` with email/password + GitHub OAuth
- Custom register page at `/register` with name, email, password, confirm password
- Sidebar bottom: user avatar (GitHub image or initials fallback), name, dropdown with sign out
- Avatar click navigates to `/profile`
- Reusable avatar component handling both image and initials cases

## Requirements

### Sign In Page (`/sign-in`)
- Email and password input fields
- "Sign in with GitHub" button
- Link to register page
- Form validation and error display

### Register Page (`/register`)
- Name, email, password, confirm password fields
- Form validation (passwords match, email format)
- Submit to `/api/auth/register`
- Redirect to sign-in on success

### Bottom Of Sidebar
- Display user avatar (GitHub image or initials fallback)
- Display user name
- Dropdown/up on avatar click with "Sign out" link
- Clicking on the icon should go to "/profile"

## References

- Spec: context/features/auth-phase-3-spec.md

## Notes

- Avatar logic: If user has `image` (from GitHub), use that. Otherwise generate initials from name (e.g., "Brad Traversy" → "BT")
- Create a reusable avatar component that handles both cases

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
- **2026-03-24**: Auth Phase 2 complete. Added Credentials provider for email/password auth. Split pattern: placeholder in auth.config.ts, bcrypt validation in auth.ts. Registration API route at /api/auth/register with input validation, duplicate check, and bcryptjs hashing.