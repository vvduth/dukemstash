import { prisma } from "@/lib/prisma";

export async function getRecentItems(userId: string, limit = 10) {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      itemType: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    contentType: item.contentType,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    type: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.tag.name),
  }));
}

export async function getPinnedItems(userId: string) {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    include: {
      itemType: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    contentType: item.contentType,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    type: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.tag.name),
  }));
}

export async function getItemStats(userId: string) {
  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, favoriteItems };
}

export async function getSystemItemTypes() {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });

  return types.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    color: t.color,
  }));
}

export async function getItemsByType(userId: string, typeName: string) {
  const items = await prisma.item.findMany({
    where: {
      userId,
      itemType: { name: typeName },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      itemType: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    contentType: item.contentType,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    type: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.tag.name),
  }));
}

export async function getItemById(itemId: string, userId: string) {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    include: {
      itemType: true,
      tags: {
        include: { tag: true },
      },
      collections: {
        include: {
          collection: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!item) return null;

  return {
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
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    type: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => ({
      id: c.collection.id,
      name: c.collection.name,
    })),
  };
}

export interface UpdateItemData {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
}

export async function updateItem(
  itemId: string,
  userId: string,
  data: UpdateItemData
) {
  // Disconnect all existing tags, then connect-or-create new ones
  await prisma.tagsOnItems.deleteMany({ where: { itemId } });

  const item = await prisma.item.update({
    where: { id: itemId, userId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    include: {
      itemType: true,
      tags: {
        include: { tag: true },
      },
      collections: {
        include: {
          collection: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  return {
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
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    type: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => ({
      id: c.collection.id,
      name: c.collection.name,
    })),
  };
}

export interface CreateItemData {
  itemTypeId: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
}

export async function createItem(userId: string, data: CreateItemData) {
  // Determine contentType based on whether url is provided
  const contentType = data.url ? "URL" : "TEXT";

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      contentType: contentType as "TEXT" | "URL" | "FILE",
      userId,
      itemTypeId: data.itemTypeId,
      tags: {
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    include: {
      itemType: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    contentType: item.contentType,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    type: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.tag.name),
  };
}

export async function deleteItem(itemId: string, userId: string) {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true },
  });

  if (!item) return null;

  await prisma.item.delete({ where: { id: itemId } });

  return { id: itemId };
}

export type SystemItemType = Awaited<ReturnType<typeof getSystemItemTypes>>[number];

export type DashboardItem = Awaited<ReturnType<typeof getRecentItems>>[number];

export type ItemDetail = NonNullable<Awaited<ReturnType<typeof getItemById>>>;