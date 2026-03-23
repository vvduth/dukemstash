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

export type DashboardItem = Awaited<ReturnType<typeof getRecentItems>>[number];