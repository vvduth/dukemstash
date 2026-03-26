# Item Types Reference

> Generated from source code analysis on 2026-03-26.

---

## Overview

Dukemstash has 7 system-defined item types, organized by content classification:

| Classification | Content Type | Types | Storage |
|----------------|-------------|-------|---------|
| Text-based | `TEXT` | snippet, prompt, note, command | `content` field (db.Text) |
| URL-based | `URL` | link | `url` field |
| File-based | `FILE` | file, image | Cloudflare R2 (`fileUrl`, `fileName`, `fileSize`) |

---

## All 7 Item Types

### 1. Snippet

| Property | Value |
|----------|-------|
| **Icon** | `Code` (Lucide) |
| **Color** | `#3b82f6` (blue) |
| **Content Type** | `TEXT` |
| **Pro Only** | No |
| **Purpose** | Code snippets with syntax highlighting |
| **Key Fields** | `content`, `language` |
| **Route** | `/items/snippets` |

The only type that uses the `language` field for programming language metadata.

---

### 2. Prompt

| Property | Value |
|----------|-------|
| **Icon** | `Sparkles` (Lucide) |
| **Color** | `#8b5cf6` (purple) |
| **Content Type** | `TEXT` |
| **Pro Only** | No |
| **Purpose** | AI prompts, system messages, workflow templates |
| **Key Fields** | `content` |
| **Route** | `/items/prompts` |

---

### 3. Note

| Property | Value |
|----------|-------|
| **Icon** | `StickyNote` (Lucide) |
| **Color** | `#fde047` (yellow) |
| **Content Type** | `TEXT` |
| **Pro Only** | No |
| **Purpose** | Free-form text notes and documentation |
| **Key Fields** | `content` |
| **Route** | `/items/notes` |

---

### 4. Command

| Property | Value |
|----------|-------|
| **Icon** | `Terminal` (Lucide) |
| **Color** | `#f97316` (orange) |
| **Content Type** | `TEXT` |
| **Pro Only** | No |
| **Purpose** | Shell/terminal commands and scripts |
| **Key Fields** | `content` |
| **Route** | `/items/commands` |

---

### 5. Link

| Property | Value |
|----------|-------|
| **Icon** | `Link` (Lucide, aliased as `LinkIcon`) |
| **Color** | `#10b981` (emerald) |
| **Content Type** | `URL` |
| **Pro Only** | No |
| **Purpose** | Bookmarks, documentation links, resource URLs |
| **Key Fields** | `url` |
| **Route** | `/items/links` |

The only type using `URL` content type. The `content` field is `null`; the `url` field stores the link.

---

### 6. File

| Property | Value |
|----------|-------|
| **Icon** | `File` (Lucide) |
| **Color** | `#6b7280` (gray) |
| **Content Type** | `FILE` |
| **Pro Only** | **Yes** |
| **Purpose** | Document and file uploads |
| **Key Fields** | `fileUrl`, `fileName`, `fileSize` |
| **Route** | `/items/files` |

Stored in Cloudflare R2. Not yet implemented (no seed data).

---

### 7. Image

| Property | Value |
|----------|-------|
| **Icon** | `Image` (Lucide) |
| **Color** | `#ec4899` (pink) |
| **Content Type** | `FILE` |
| **Pro Only** | **Yes** |
| **Purpose** | Image uploads and screenshots |
| **Key Fields** | `fileUrl`, `fileName`, `fileSize` |
| **Route** | `/items/images` |

Stored in Cloudflare R2. Not yet implemented (no seed data).

---

## Field Usage Matrix

| Field | snippet | prompt | note | command | link | file | image |
|-------|---------|--------|------|---------|------|------|-------|
| `content` | Y | Y | Y | Y | - | - | - |
| `url` | - | - | - | - | Y | - | - |
| `fileUrl` | - | - | - | - | - | Y | Y |
| `fileName` | - | - | - | - | - | Y | Y |
| `fileSize` | - | - | - | - | - | Y | Y |
| `language` | Y | - | - | - | - | - | - |

---

## Shared Properties (All Types)

Every item, regardless of type, has:

- `id` (CUID), `title` (required), `description` (optional)
- `isFavorite`, `isPinned` (boolean flags)
- `userId`, `itemTypeId` (foreign keys)
- `createdAt`, `updatedAt` (timestamps)
- Many-to-many relations: `tags`, `collections`

---

## Display Behavior

**ItemCard rendering** ([src/components/dashboard/ItemCard.tsx](src/components/dashboard/ItemCard.tsx)):

- **Border color**: Type color at 25% opacity (`${type.color}40`)
- **Icon + label**: Colored icon and capitalized type name
- **Preview text**: URL types show `url` field; all others show `description` or first 120 chars of `content`
- **Tags**: Up to 3 tags shown as small badges
- **Pin indicator**: Pin icon in top-right corner when `isPinned: true`
- **Font**: Preview uses `font-mono` for all types

---

## Icon Map

Defined in [src/lib/constants/icon-map.ts](src/lib/constants/icon-map.ts):

```typescript
export const ICON_MAP = {
  Code,        // snippet
  Sparkles,    // prompt
  StickyNote,  // note
  Terminal,    // command
  Link: LinkIcon, // link (aliased to avoid conflict)
  File,        // file
  Image,       // image
} as const;
```

---

## Pricing Restrictions

| Tier | Available Types | Limits |
|------|----------------|--------|
| **Free** | snippet, prompt, note, command, link | 50 items, 3 collections |
| **Pro** ($8/mo) | All 7 types (adds file, image) | Unlimited |

Pro-only types show a `PRO` badge in the sidebar navigation.

---

## Source Files

| File | What it defines |
|------|----------------|
| `prisma/schema.prisma` | Item model, ItemType model, ContentType enum |
| `prisma/seed.ts` | System type definitions, demo data (18 items) |
| `src/lib/constants/icon-map.ts` | Lucide icon mapping |
| `src/components/dashboard/ItemCard.tsx` | Card rendering logic |
| `src/lib/db/items.ts` | Database queries (getRecentItems, getPinnedItems, getItemStats) |
