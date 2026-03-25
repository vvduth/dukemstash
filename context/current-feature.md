# Current Feature

## Status

Not Started

## Goals

-

## Notes

-

## History
- **2026-03-20**: Initial Next.js 16 project setup with TypeScript, Tailwind CSS v4, and shadcn/ui. Project scaffolded via Create Next App.
- **2026-03-23**: Prisma 7 + Neon PostgreSQL setup complete. Schema with all models, initial migration, seed script, PrismaPg driver adapter, singleton client, and test script.
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
- **2026-03-24**: Auth Phase 3 complete. Custom sign-in page (/sign-in) with email/password and GitHub OAuth. Custom register page (/register) with validation and toast on success. Reusable UserAvatar component (GitHub image or initials). Sidebar dropdown with profile link and sign out. All auth redirects updated to /sign-in.
- **2026-03-25**: Email verification on register complete. Resend integration for sending verification emails. Verification token helpers using existing VerificationToken Prisma model. /verify-email page validates tokens server-side. Unverified users blocked at sign-in with resend option. Register form shows "check your email" success screen. Dashboard page fixed to use auth session instead of findFirst().
- **2026-03-25**: Email verification toggle complete. Added EMAIL_VERIFICATION_ENABLED env var (default: false) to toggle entire verification system. When disabled: users auto-verified at registration, no email sent, sign-in allows unverified. Single helper isEmailVerificationEnabled() in src/lib/email.ts used across all auth routes.
- **2026-03-25**: Forgot password flow complete. "Forgot password?" link on sign-in page. /forgot-password page with email form. /reset-password page with new password form. API routes for token generation and password reset. Reuses VerificationToken model with "reset:" prefix. 1-hour token expiry, single-use, no user enumeration. Sends reset email via Resend.
- **2026-03-25**: Profile page complete. /dashboard/profile route with user info (avatar, name, email, join date), usage stats (total items, collections, breakdown by item type), change password form (email users only), and delete account with AlertDialog confirmation. API routes for change-password and delete-account. Sidebar profile link updated.