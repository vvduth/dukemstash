import { prisma } from "@/lib/prisma";

type ItemWithRelations = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  contentType: string;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  itemType: { name: string; icon: string; color: string };
  tags: { tag: { name: string } }[];
};

function mapToDashboardItem(item: ItemWithRelations) {
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
}

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

  return items.map(mapToDashboardItem);
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

  return items.map(mapToDashboardItem);
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

export async function getItemsByType(
  userId: string,
  typeName: string,
  page = 1,
  perPage = 21
) {
  const where = {
    userId,
    itemType: { name: typeName },
  };

  const [items, totalCount] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        itemType: true,
        tags: {
          include: { tag: true },
        },
      },
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items: items.map(mapToDashboardItem),
    totalCount,
    totalPages: Math.ceil(totalCount / perPage),
  };
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
  collectionIds: string[];
}

export async function updateItem(
  itemId: string,
  userId: string,
  data: UpdateItemData
) {
  // Disconnect all existing tags and collections, then reconnect
  await Promise.all([
    prisma.tagsOnItems.deleteMany({ where: { itemId } }),
    prisma.itemsOnCollections.deleteMany({ where: { itemId } }),
  ]);

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
      collections: {
        create: data.collectionIds.map((collectionId) => ({
          collectionId,
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
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  collectionIds: string[];
}

export async function createItem(userId: string, data: CreateItemData) {
  // Determine contentType based on fields provided
  const contentType = data.fileUrl ? "FILE" : data.url ? "URL" : "TEXT";

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
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
      collections: {
        create: data.collectionIds.map((collectionId) => ({
          collectionId,
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
    contentType: item.contentType,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    fileUrl: item.fileUrl,
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

export async function deleteItem(itemId: string, userId: string) {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true, fileUrl: true },
  });

  if (!item) return null;

  await prisma.item.delete({ where: { id: itemId } });

  return { id: itemId, fileUrl: item.fileUrl };
}

export async function getSearchItems(userId: string) {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      url: true,
      fileName: true,
      itemType: {
        select: { name: true, icon: true, color: true },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    preview: item.content?.slice(0, 100) ?? item.url ?? item.fileName ?? null,
    type: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
  }));
}

export async function getFavoriteItems(userId: string) {
  const items = await prisma.item.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    include: {
      itemType: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  return items.map(mapToDashboardItem);
}

export type SearchItem = Awaited<ReturnType<typeof getSearchItems>>[number];

export type SystemItemType = Awaited<ReturnType<typeof getSystemItemTypes>>[number];

export type DashboardItem = Awaited<ReturnType<typeof getRecentItems>>[number];

export type ItemDetail = NonNullable<Awaited<ReturnType<typeof getItemById>>>;