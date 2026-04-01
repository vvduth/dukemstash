import { prisma } from "@/lib/prisma";

interface TypeInfo {
  count: number;
  color: string;
  icon: string;
  name: string;
}

function computeDominantTypes(
  items: { item: { itemType: { id: string; color: string; icon: string; name: string } } }[]
): TypeInfo[] {
  const typeCounts = new Map<string, TypeInfo>();

  for (const rel of items) {
    const type = rel.item.itemType;
    const existing = typeCounts.get(type.id);
    if (existing) {
      existing.count++;
    } else {
      typeCounts.set(type.id, {
        count: 1,
        color: type.color,
        icon: type.icon,
        name: type.name,
      });
    }
  }

  return Array.from(typeCounts.values()).sort((a, b) => b.count - a.count);
}

export async function getRecentCollections(userId: string, limit = 6) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        take: 50,
        include: {
          item: {
            include: {
              itemType: true,
            },
          },
        },
      },
      _count: {
        select: { items: true },
      },
    },
  });

  return collections.map((col) => {
    const sortedTypes = computeDominantTypes(col.items);

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col._count.items,
      dominantColor: sortedTypes[0]?.color ?? null,
      types: sortedTypes.map((t) => ({
        name: t.name,
        icon: t.icon,
        color: t.color,
      })),
    };
  });
}

export async function getFavoriteCollections(userId: string) {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return collections;
}

export async function getSidebarRecentCollections(userId: string, limit = 4) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        take: 50,
        include: {
          item: {
            include: {
              itemType: true,
            },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const sortedTypes = computeDominantTypes(col.items);

    return {
      id: col.id,
      name: col.name,
      dominantColor: sortedTypes[0]?.color ?? null,
    };
  });
}

export type SidebarCollection = Awaited<ReturnType<typeof getSidebarRecentCollections>>[number];

export type FavoriteCollection = Awaited<ReturnType<typeof getFavoriteCollections>>[number];

export type DashboardCollection = Awaited<ReturnType<typeof getRecentCollections>>[number];

export async function getUserCollections(userId: string) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return collections;
}

export type UserCollection = Awaited<ReturnType<typeof getUserCollections>>[number];

export async function getAllCollections(userId: string) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        take: 50,
        include: {
          item: {
            include: {
              itemType: true,
            },
          },
        },
      },
      _count: {
        select: { items: true },
      },
    },
  });

  return collections.map((col) => {
    const sortedTypes = computeDominantTypes(col.items);

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col._count.items,
      dominantColor: sortedTypes[0]?.color ?? null,
      types: sortedTypes.map((t) => ({
        name: t.name,
        icon: t.icon,
        color: t.color,
      })),
    };
  });
}

export async function getCollectionWithItems(collectionId: string, userId: string) {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    include: {
      items: {
        orderBy: { addedAt: "desc" },
        include: {
          item: {
            include: {
              itemType: true,
              tags: {
                include: { tag: true },
              },
            },
          },
        },
      },
      _count: {
        select: { items: true },
      },
    },
  });

  if (!collection) return null;

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    itemCount: collection._count.items,
    items: collection.items.map((rel) => {
      const item = rel.item;
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
        fileUrl: item.fileUrl,
        fileName: item.fileName,
        fileSize: item.fileSize,
        createdAt: item.createdAt.toISOString(),
        type: {
          name: item.itemType.name,
          icon: item.itemType.icon,
          color: item.itemType.color,
        },
        tags: item.tags.map((t) => t.tag.name),
      };
    }),
  };
}

export async function createCollection(
  userId: string,
  data: { name: string; description: string | null }
) {
  return prisma.collection.create({
    data: {
      name: data.name,
      description: data.description,
      userId,
    },
  });
}