import { prisma } from "@/lib/prisma";

export async function getRecentCollections(userId: string, limit = 6) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
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
    // Count items per type to find the dominant type
    const typeCounts = new Map<string, { count: number; color: string; icon: string; name: string }>();

    for (const rel of col.items) {
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

    // Sort types by count (most used first)
    const sortedTypes = Array.from(typeCounts.values()).sort(
      (a, b) => b.count - a.count
    );

    // Dominant type color for border
    const dominantColor = sortedTypes[0]?.color ?? null;

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col._count.items,
      dominantColor,
      types: sortedTypes.map((t) => ({
        name: t.name,
        icon: t.icon,
        color: t.color,
      })),
    };
  });
}

export type DashboardCollection = Awaited<
  ReturnType<typeof getRecentCollections>
>[number];