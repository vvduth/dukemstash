import { prisma } from "@/lib/prisma";

export async function getProfileStats(userId: string) {
  const [totalItems, totalCollections, itemsByType] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.groupBy({
      by: ["itemTypeId"],
      where: { userId },
      _count: { id: true },
    }),
  ]);

  // Get type details for the grouped counts
  const typeIds = itemsByType.map((g) => g.itemTypeId);
  const types = typeIds.length > 0
    ? await prisma.itemType.findMany({
        where: { id: { in: typeIds } },
      })
    : [];

  const typeBreakdown = itemsByType.map((g) => {
    const type = types.find((t) => t.id === g.itemTypeId);
    return {
      name: type?.name ?? "unknown",
      icon: type?.icon ?? "File",
      color: type?.color ?? "#6b7280",
      count: g._count.id,
    };
  });

  return { totalItems, totalCollections, typeBreakdown };
}
