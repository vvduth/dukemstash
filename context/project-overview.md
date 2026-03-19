# Dukemstash - Project Overview

> **One fast, searchable, AI-enhanced hub for all developer knowledge & resources.**

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Target Users](#target-users)
3. [Features](#features)
4. [Data Models](#data-models)
5. [Tech Stack](#tech-stack)
6. [Monetization](#monetization)
7. [UI/UX Design](#uiux-design)

---

## Problem Statement

Developers keep their essentials scattered across multiple tools:

| Resource | Typical Location |
|----------|------------------|
| Code snippets | VS Code, Notion |
| AI prompts | Chat histories |
| Context files | Buried in projects |
| Useful links | Browser bookmarks |
| Documentation | Random folders |
| Commands | .txt files, bash history |
| Templates | GitHub Gists |

**Result:** Context switching, lost knowledge, and inconsistent workflows.

**Solution:** Dukemstash provides a single, fast, searchable, AI-enhanced hub for all developer knowledge and resources.

---

## Target Users

| User Type | Primary Needs |
|-----------|---------------|
| **Everyday Developer** | Fast access to snippets, prompts, commands, links |
| **AI-first Developer** | Save prompts, contexts, workflows, system messages |
| **Content Creator / Educator** | Store code blocks, explanations, course notes |
| **Full-stack Builder** | Collect patterns, boilerplates, API examples |

---

## Features

### A. Items & Item Types

Items are the core content units. Each item has a type that determines its behavior and appearance.

**System Types (immutable):**

| Type | Content Type | Icon | Color | Route |
|------|--------------|------|-------|-------|
| `snippet` | Text | `Code` | `#3b82f6` (blue) | `/items/snippets` |
| `prompt` | Text | `Sparkles` | `#8b5cf6` (purple) | `/items/prompts` |
| `note` | Text | `StickyNote` | `#fde047` (yellow) | `/items/notes` |
| `command` | Text | `Terminal` | `#f97316` (orange) | `/items/commands` |
| `link` | URL | `Link` | `#10b981` (emerald) | `/items/links` |
| `file` | File | `File` | `#6b7280` (gray) | `/items/files` |
| `image` | File | `Image` | `#ec4899` (pink) | `/items/images` |

> **Pro Only:** `file` and `image` types require Pro subscription.

### B. Collections

Users can organize items into collections. Items can belong to multiple collections.

**Examples:**
- React Patterns (snippets, notes)
- Context Files (files)
- Python Snippets (snippets)
- Interview Prep (snippets, prompts)

### C. Search

Full-text search across:
- Content
- Tags
- Titles
- Types

### D. Authentication

- Email/password
- GitHub OAuth

### E. Core Features

- ⭐ Collection and item favorites
- 📌 Pin items to top
- 🕐 Recently used tracking
- 📥 Import code from file
- ✍️ Markdown editor for text types
- 📤 File upload for file types
- 💾 Export data (JSON/ZIP)
- 🌙 Dark mode (default)
- 🏷️ Multi-collection item assignment

### F. AI Features (Pro Only)

- 🤖 AI auto-tag suggestions
- 📝 AI Summaries
- 💡 AI Explain This Code
- ⚡ Prompt optimizer

---

## Data Models

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│    ┌─────────┐         ┌──────────┐         ┌────────────┐                 │
│    │  USER   │─────────│   ITEM   │─────────│  ITEMTYPE  │                 │
│    └────┬────┘    1:N  └────┬─────┘    N:1  └────────────┘                 │
│         │                   │                                               │
│         │                   │ N:M                                           │
│         │                   │                                               │
│         │            ┌──────┴──────┐                                        │
│         │            │             │                                        │
│         │     ┌──────┴─────┐ ┌─────┴──────┐                                │
│         │     │ COLLECTION │ │    TAG     │                                │
│         │     └────────────┘ └────────────┘                                │
│         │           1:N                                                     │
│         └───────────┘                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USER (extends NextAuth)
// ============================================================================

model User {
  id                   String    @id @default(cuid())
  name                 String?
  email                String    @unique
  emailVerified        DateTime?
  image                String?
  password             String?   // For email/password auth
  
  // Pro subscription
  isPro                Boolean   @default(false)
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  
  // Relations
  items                Item[]
  collections          Collection[]
  itemTypes            ItemType[]
  accounts             Account[]
  sessions             Session[]
  
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@map("users")
}

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================================================
// ITEM TYPES
// ============================================================================

model ItemType {
  id        String   @id @default(cuid())
  name      String   // "snippet", "prompt", "note", etc.
  icon      String   // Lucide icon name
  color     String   // Hex color code
  isSystem  Boolean  @default(false)
  
  // Relations
  userId    String?  // null for system types
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     Item[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([name, userId])
  @@map("item_types")
}

// ============================================================================
// ITEMS
// ============================================================================

model Item {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  
  // Content (mutually exclusive based on contentType)
  contentType ContentType @default(TEXT)
  content     String?     @db.Text   // For text types (snippet, note, prompt, command)
  url         String?                 // For link type
  fileUrl     String?                 // R2 URL for file/image types
  fileName    String?                 // Original filename
  fileSize    Int?                    // File size in bytes
  
  // Metadata
  language    String?                 // Programming language (for code)
  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)
  
  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  itemTypeId  String
  itemType    ItemType @relation(fields: [itemTypeId], references: [id])
  
  tags        TagsOnItems[]
  collections ItemsOnCollections[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([itemTypeId])
  @@index([isFavorite])
  @@index([isPinned])
  @@map("items")
}

enum ContentType {
  TEXT
  URL
  FILE
}

// ============================================================================
// COLLECTIONS
// ============================================================================

model Collection {
  id            String   @id @default(cuid())
  name          String   // "React Hooks", "Prototype Prompts", etc.
  description   String?  @db.Text
  isFavorite    Boolean  @default(false)
  
  // Default type for new items added to this collection
  defaultTypeId String?
  
  // Relations
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  items         ItemsOnCollections[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([name, userId])
  @@index([userId])
  @@map("collections")
}

// ============================================================================
// JOIN TABLES
// ============================================================================

model ItemsOnCollections {
  itemId       String
  item         Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  
  addedAt      DateTime   @default(now())

  @@id([itemId, collectionId])
  @@map("items_on_collections")
}

model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  items TagsOnItems[]

  @@map("tags")
}

model TagsOnItems {
  itemId String
  item   Item   @relation(fields: [itemId], references: [id], onDelete: Cascade)
  
  tagId  String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
  @@map("tags_on_items")
}
```

### Seed Data (System Types)

```typescript
// prisma/seed.ts

const systemTypes = [
  { name: 'snippet', icon: 'Code',       color: '#3b82f6', isSystem: true },
  { name: 'prompt',  icon: 'Sparkles',   color: '#8b5cf6', isSystem: true },
  { name: 'note',    icon: 'StickyNote', color: '#fde047', isSystem: true },
  { name: 'command', icon: 'Terminal',   color: '#f97316', isSystem: true },
  { name: 'link',    icon: 'Link',       color: '#10b981', isSystem: true },
  { name: 'file',    icon: 'File',       color: '#6b7280', isSystem: true },
  { name: 'image',   icon: 'Image',      color: '#ec4899', isSystem: true },
];
```

---

## Tech Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16 | Full-stack React framework |
| [React](https://react.dev/) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Latest | Type safety |

### Database & Storage

| Technology | Purpose |
|------------|---------|
| [Neon](https://neon.tech/) | Serverless PostgreSQL |
| [Prisma](https://www.prisma.io/) | ORM (v7) |
| [Cloudflare R2](https://www.cloudflare.com/r2/) | File storage |
| Redis | Caching (future) |

### Authentication

| Technology | Purpose |
|------------|---------|
| [NextAuth.js](https://next-auth.js.org/) | v5 - Authentication |
| GitHub OAuth | Social login |
| Email/Password | Credential auth |

### UI & Styling

| Technology | Purpose |
|------------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | v4 - Utility CSS |
| [shadcn/ui](https://ui.shadcn.com/) | Component library |
| [Lucide Icons](https://lucide.dev/) | Icon set |

### AI Integration

| Provider | Model |
|----------|-------|
| [OpenAI](https://openai.com/) | gpt-5-nano |

### Key Principles

> ⚠️ **IMPORTANT:** Never use `db push` or directly update database structure. Always create migrations that run in dev first, then production.

---

## Monetization

### Pricing Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│                           FREE                                   │
├─────────────────────────────────────────────────────────────────┤
│  ✓ 50 items total                                               │
│  ✓ 3 collections                                                │
│  ✓ System types (snippet, prompt, note, command, link)         │
│  ✓ Basic search                                                 │
│  ✗ No file/image uploads                                        │
│  ✗ No AI features                                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     PRO  $8/mo or $72/yr                        │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Unlimited items                                              │
│  ✓ Unlimited collections                                        │
│  ✓ File & image uploads                                         │
│  ✓ Custom types (coming soon)                                   │
│  ✓ AI auto-tagging                                              │
│  ✓ AI code explanation                                          │
│  ✓ AI prompt optimizer                                          │
│  ✓ Export data (JSON/ZIP)                                       │
│  ✓ Priority support                                             │
└─────────────────────────────────────────────────────────────────┘
```

> **Development Mode:** All users have access to all features during development.

---

## UI/UX Design

### Design Principles

- Modern, minimal, developer-focused
- Dark mode by default, light mode optional
- Clean typography, generous whitespace
- Subtle borders and shadows
- Syntax highlighting for code blocks

**Design References:** Notion, Linear, Raycast

### Layout Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Dukemstash                                              [Search] [⚙️] [👤]  │
├──────────────┬─────────────────────────────────────────────────────────────┤
│              │                                                             │
│  SIDEBAR     │                    MAIN CONTENT                             │
│              │                                                             │
│  ┌─────────┐ │  ┌─────────────────────────────────────────────────────┐   │
│  │ Types   │ │  │                   COLLECTIONS                        │   │
│  ├─────────┤ │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │ Snippets│ │  │  │ React   │ │ Python  │ │ Context │ │ Prompts │   │   │
│  │ Prompts │ │  │  │ Patterns│ │ Scripts │ │ Files   │ │ Library │   │   │
│  │ Commands│ │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  │ Notes   │ │  └─────────────────────────────────────────────────────┘   │
│  │ Links   │ │                                                             │
│  │ Files   │ │  ┌─────────────────────────────────────────────────────┐   │
│  │ Images  │ │  │                      ITEMS                           │   │
│  ├─────────┤ │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │ Recent  │ │  │  │ Item 1  │ │ Item 2  │ │ Item 3  │ │ Item 4  │   │   │
│  │ Collec- │ │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  │ tions   │ │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │         │ │  │  │ Item 5  │ │ Item 6  │ │ Item 7  │ │ Item 8  │   │   │
│  │ ★ Saved │ │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  │ ★ Proje │ │  └─────────────────────────────────────────────────────┘   │
│  └─────────┘ │                                                             │
│              │                                                             │
└──────────────┴─────────────────────────────────────────────────────────────┘
```

### Item Drawer

Items open in a quick-access drawer for fast viewing and editing.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                        [✕] Close    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Title: useLocalStorage Hook                                        │
│  Type:  ● Snippet                                                   │
│  Tags:  [react] [hooks] [storage]                                   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ```typescript                                                │   │
│  │ export function useLocalStorage<T>(                          │   │
│  │   key: string,                                               │   │
│  │   initialValue: T                                            │   │
│  │ ): [T, (value: T) => void] {                                │   │
│  │   // ...                                                     │   │
│  │ }                                                            │   │
│  │ ```                                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Collections: [React Patterns] [Interview Prep] [+]                │
│                                                                     │
│  [★ Favorite]  [📌 Pin]  [✏️ Edit]  [🗑️ Delete]                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Type Colors & Icons Reference

```typescript
// lib/constants/item-types.ts

export const ITEM_TYPES = {
  snippet: { icon: 'Code',       color: '#3b82f6' }, // blue
  prompt:  { icon: 'Sparkles',   color: '#8b5cf6' }, // purple
  command: { icon: 'Terminal',   color: '#f97316' }, // orange
  note:    { icon: 'StickyNote', color: '#fde047' }, // yellow
  file:    { icon: 'File',       color: '#6b7280' }, // gray
  image:   { icon: 'Image',      color: '#ec4899' }, // pink
  link:    { icon: 'Link',       color: '#10b981' }, // emerald
} as const;
```

### Color Coding

- **Collection cards:** Background color based on most common item type
- **Item cards:** Border color based on item type
- **Consistent visual language** for quick type identification

### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Desktop (≥1024px) | Sidebar + Main content |
| Tablet (768-1023px) | Collapsible sidebar |
| Mobile (<768px) | Sidebar becomes drawer |

### Micro-interactions

- Smooth transitions on hover/focus
- Hover states on cards with subtle elevation
- Toast notifications for actions (save, delete, copy)
- Loading skeletons during data fetch
- Keyboard shortcuts for power users

---

## Project Links

| Resource | URL |
|----------|-----|
| Prisma Docs | https://www.prisma.io/docs |
| Next.js Docs | https://nextjs.org/docs |
| NextAuth.js Docs | https://authjs.dev |
| shadcn/ui Docs | https://ui.shadcn.com |
| Tailwind CSS Docs | https://tailwindcss.com/docs |
| Neon Docs | https://neon.tech/docs |
| Cloudflare R2 Docs | https://developers.cloudflare.com/r2 |
| Lucide Icons | https://lucide.dev/icons |
