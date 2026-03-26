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

export type SystemItemType = Awaited<ReturnType<typeof getSystemItemTypes>>[number];

export type DashboardItem = Awaited<ReturnType<typeof getRecentItems>>[number];

export type ItemDetail = NonNullable<Awaited<ReturnType<typeof getItemById>>>;