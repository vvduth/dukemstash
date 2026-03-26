# Item CRUD Architecture

> Designed 2026-03-26. Unified CRUD system for all 7 item types.

---

## Principles

1. **One action file** for all mutations (create, update, delete)
2. **One DB query file** for all read operations (called from server components)
3. **One dynamic route** (`/items/[type]`) that adapts by type
4. **Type-specific logic lives in components**, not in actions or DB functions
5. **Server Actions** for mutations (per coding standards: "Use Server Actions for form submissions and simple mutations")

---

## File Structure

```
src/
├── actions/
│   └── items.ts                    # All item mutations (create, update, delete, toggle)
│
├── lib/
│   └── db/
│       └── items.ts                # All item queries (existing + new)
│
├── app/
│   └── dashboard/
│       └── items/
│           └── [type]/
│               └── page.tsx        # Dynamic route: /dashboard/items/snippets, etc.
│
├── components/
│   └── items/
│       ├── ItemList.tsx            # Grid/list of items (client component)
│       ├── ItemCard.tsx            # Individual item card (move from dashboard/)
│       ├── ItemDrawer.tsx          # Side drawer for view/edit (client component)
│       ├── ItemForm.tsx            # Create/edit form (client component)
│       ├── ItemFormFields.tsx      # Type-specific field rendering
│       ├── DeleteItemDialog.tsx    # Delete confirmation
│       └── ItemPageHeader.tsx      # Page title, icon, "New" button
│
└── types/
    └── items.ts                    # Shared item types/interfaces
```

---

## Routing: `/dashboard/items/[type]`

A single dynamic route handles all 7 item types.

### Route: `src/app/dashboard/items/[type]/page.tsx`

```typescript
// Server component
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getItemsByType, getSystemItemTypes } from '@/lib/db/items'
import { ItemList } from '@/components/items/ItemList'
import { ItemPageHeader } from '@/components/items/ItemPageHeader'

// Valid type slugs (plural → singular mapping)
const TYPE_SLUGS: Record<string, string> = {
  snippets: 'snippet',
  prompts: 'prompt',
  notes: 'note',
  commands: 'command',
  links: 'link',
  files: 'file',
  images: 'image',
}

export default async function ItemsPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  await connection()
  const { type: typeSlug } = await params

  const typeName = TYPE_SLUGS[typeSlug]
  if (!typeName) redirect('/dashboard')

  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const [items, itemTypes] = await Promise.all([
    getItemsByType(session.user.id, typeName),
    getSystemItemTypes(),
  ])

  const currentType = itemTypes.find((t) => t.name === typeName)
  if (!currentType) redirect('/dashboard')

  return (
    <>
      <ItemPageHeader type={currentType} />
      <ItemList items={items} type={currentType} />
    </>
  )
}
```

**URL examples:**
- `/dashboard/items/snippets` → shows all snippets
- `/dashboard/items/prompts` → shows all prompts
- `/dashboard/items/links` → shows all links

The sidebar already links to `/items/snippets`, etc. These will need updating to `/dashboard/items/snippets`.

---

## Server Actions: `src/actions/items.ts`

All mutations in one file. Uses `'use server'` directive, Zod validation, auth checks, and the `{ success, data, error }` return pattern.

```typescript
'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { ContentType } from '@/generated/prisma'

// ── Schemas ──────────────────────────────────────────────

const createItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  itemTypeId: z.string().cuid(),
  contentType: z.nativeEnum(ContentType),
  content: z.string().optional(),
  url: z.string().url().optional(),
  language: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
})

const updateItemSchema = createItemSchema.partial().extend({
  id: z.string().cuid(),
})

// ── Create ───────────────────────────────────────────────

export async function createItem(data: z.infer<typeof createItemSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const parsed = createItemSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: 'Invalid input' }

    const { tags, ...itemData } = parsed.data

    const item = await prisma.item.create({
      data: {
        ...itemData,
        userId: session.user.id,
        ...(tags?.length && {
          tags: {
            create: tags.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { name },
                  create: { name },
                },
              },
            })),
          },
        }),
      },
    })

    revalidatePath('/dashboard')
    return { success: true, data: item }
  } catch {
    return { success: false, error: 'Something went wrong' }
  }
}

// ── Update ───────────────────────────────────────────────

export async function updateItem(data: z.infer<typeof updateItemSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const parsed = updateItemSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: 'Invalid input' }

    const { id, tags, ...itemData } = parsed.data

    // Verify ownership
    const existing = await prisma.item.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) return { success: false, error: 'Item not found' }

    const item = await prisma.item.update({
      where: { id },
      data: {
        ...itemData,
        ...(tags !== undefined && {
          tags: {
            deleteMany: {},
            create: tags.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { name },
                  create: { name },
                },
              },
            })),
          },
        }),
      },
    })

    revalidatePath('/dashboard')
    return { success: true, data: item }
  } catch {
    return { success: false, error: 'Something went wrong' }
  }
}

// ── Delete ───────────────────────────────────────────────

export async function deleteItem(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const existing = await prisma.item.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) return { success: false, error: 'Item not found' }

    await prisma.item.delete({ where: { id } })

    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Something went wrong' }
  }
}

// ── Toggle Favorite ──────────────────────────────────────

export async function toggleFavorite(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const item = await prisma.item.findFirst({
      where: { id, userId: session.user.id },
      select: { isFavorite: true },
    })
    if (!item) return { success: false, error: 'Item not found' }

    await prisma.item.update({
      where: { id },
      data: { isFavorite: !item.isFavorite },
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Something went wrong' }
  }
}

// ── Toggle Pin ───────────────────────────────────────────

export async function togglePin(id: string) {
  // Same pattern as toggleFavorite but for isPinned
}
```

---

## DB Queries: `src/lib/db/items.ts`

Extend the existing file with new query functions:

```typescript
// ── New functions to add ─────────────────────────────────

// Get all items of a specific type for a user
export async function getItemsByType(
  userId: string,
  typeName: string,
  options?: { limit?: number; offset?: number }
) {
  const items = await prisma.item.findMany({
    where: {
      userId,
      itemType: { name: typeName },
    },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: true } },
    },
    orderBy: [
      { isPinned: 'desc' },
      { updatedAt: 'desc' },
    ],
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  })

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    contentType: item.contentType,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    type: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
  }))
}

// Get a single item by ID (for drawer/detail view)
export async function getItemById(userId: string, itemId: string) {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: true } },
      collections: {
        include: { collection: { select: { id: true, name: true } } },
      },
    },
  })

  if (!item) return null

  return {
    ...item,
    type: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => c.collection),
  }
}
```

---

## Components

### ItemPageHeader

Server-rendered header with type icon, name, count, and "New Item" button.

```
┌──────────────────────────────────────────────────────┐
│  [Icon] Snippets                        [+ New Item] │
│  12 items                                            │
└──────────────────────────────────────────────────────┘
```

### ItemList (Client Component)

- Receives items array and type info as props
- Renders grid of ItemCards
- Handles empty state ("No snippets yet")
- Opens ItemDrawer on card click
- Manages selected item state

### ItemCard

Move from `src/components/dashboard/ItemCard.tsx` to `src/components/items/ItemCard.tsx`. No logic changes needed - it already renders adaptively based on type.

### ItemDrawer (Client Component)

Side drawer that opens when clicking an item. Shows full detail and edit capabilities.

```
┌────────────────────────────────────────────────────┐
│                                          [X] Close │
├────────────────────────────────────────────────────┤
│  [Icon] Snippet                                    │
│                                                    │
│  Title: useLocalStorage Hook                       │
│  Tags: [react] [hooks] [storage]                   │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ // Content displayed based on type:          │  │
│  │ // TEXT → code block / markdown              │  │
│  │ // URL  → clickable link                    │  │
│  │ // FILE → download link + file info         │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  Collections: [React Patterns] [+]                 │
│                                                    │
│  [★ Fav]  [Pin]  [Edit]  [Copy]  [Delete]         │
└────────────────────────────────────────────────────┘
```

### ItemForm (Client Component)

Shared form for create and edit. Adapts fields based on content type:

| Content Type | Fields Shown |
|-------------|-------------|
| `TEXT` | title, description, content (textarea/editor), language (snippet only), tags |
| `URL` | title, description, url, tags |
| `FILE` | title, description, file upload, tags |

### ItemFormFields

Renders the type-specific portion of the form:
- **TEXT types**: Content textarea (or code editor for snippets), language selector for snippets
- **URL type**: URL input with validation
- **FILE types**: File upload dropzone (future, Pro-only)

### DeleteItemDialog

Reusable AlertDialog (same pattern as delete account on profile page).

---

## Type-Specific Logic Summary

| Concern | Where it lives |
|---------|---------------|
| Which fields to save | Zod schema in `actions/items.ts` (validates based on contentType) |
| Which fields to show in form | `ItemFormFields.tsx` (switches on contentType) |
| Which fields to show in drawer | `ItemDrawer.tsx` (switches on contentType) |
| How card looks | `ItemCard.tsx` (already adaptive — uses type color, shows url vs content) |
| Routing | `[type]/page.tsx` (slug → type name mapping) |

Actions and DB functions are type-agnostic. They operate on the unified Item model. All type-specific rendering is in components.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        SERVER                                │
│                                                             │
│  /dashboard/items/[type]/page.tsx                           │
│       │                                                     │
│       ├── auth()           → session                        │
│       ├── getItemsByType() → items[]     (lib/db/items.ts)  │
│       └── getSystemItemTypes() → types[] (lib/db/items.ts)  │
│                                                             │
│  Props passed to client components:                         │
│       ↓                                                     │
├─────────────────────────────────────────────────────────────┤
│                        CLIENT                                │
│                                                             │
│  <ItemList items={items} type={type}>                       │
│       │                                                     │
│       ├── <ItemCard />  → click → opens drawer              │
│       ├── <ItemDrawer>                                      │
│       │     ├── view mode (detail display)                  │
│       │     └── edit mode → <ItemForm>                      │
│       │           └── calls Server Action (createItem, etc.)│
│       │                                                     │
│       └── <DeleteItemDialog>                                │
│             └── calls deleteItem() Server Action            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Sidebar URL Update

Current sidebar links go to `/items/snippets`. Update to `/dashboard/items/snippets` to match the new route structure (items pages live under the authenticated dashboard layout).

---

## Implementation Order

1. **Types & queries** — `src/types/items.ts`, extend `src/lib/db/items.ts`
2. **Server actions** — `src/actions/items.ts` (create, update, delete, toggles)
3. **Route** — `src/app/dashboard/items/[type]/page.tsx`
4. **Components** — ItemPageHeader, ItemList, ItemDrawer, ItemForm, DeleteItemDialog
5. **Wire up sidebar** — Update links to `/dashboard/items/[type]`

---

## Source Files Referenced

| File | Role |
|------|------|
| `prisma/schema.prisma` | Item, ItemType, ContentType models |
| `src/lib/db/items.ts` | Existing query functions to extend |
| `src/lib/constants/icon-map.ts` | Icon mapping for type display |
| `src/components/dashboard/ItemCard.tsx` | Existing card component to relocate |
| `src/app/dashboard/layout.tsx` | Auth guard + sidebar data pattern |
| `src/app/dashboard/page.tsx` | Server component data fetching pattern |
| `docs/item-types.md` | Type reference (field matrix, colors, icons) |
