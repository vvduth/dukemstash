import Link from 'next/link';
import { Pin } from 'lucide-react';
import { connection } from 'next/server';
import { getRecentCollections, getUserCollections } from '@/lib/db/collections';
import { getRecentItems, getPinnedItems, getItemStats } from '@/lib/db/items';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { CollectionCard } from '@/components/dashboard/CollectionCard';
import { ItemGridWithDrawer } from '@/components/dashboard/ItemGridWithDrawer';

export default async function DashboardPage() {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const [
    recentCollections,
    totalCollections,
    favoriteCollections,
    recentItems,
    pinnedItems,
    itemStats,
    userCollections,
  ] = await Promise.all([
    getRecentCollections(userId, 6),
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
    getRecentItems(userId, 10),
    getPinnedItems(userId),
    getItemStats(userId),
    getUserCollections(userId),
  ]);

  const { totalItems, favoriteItems } = itemStats;

  const displayName = session.user?.name?.split(' ')[0] ?? 'Developer';

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, {displayName}! Here&apos;s your knowledge hub.
        </p>
      </div>

      {/* Stats cards */}
      <StatsCards
        totalItems={totalItems}
        totalCollections={totalCollections}
        favoriteItems={favoriteItems}
        favoriteCollections={favoriteCollections}
      />

      {/* Recent collections */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Collections
          </h2>
          <Link
            href="/dashboard/collections"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {recentCollections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      </section>

      {/* Pinned items */}
      {pinnedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="h-3.5 w-3.5 text-muted-foreground fill-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Pinned
            </h2>
          </div>
          <ItemGridWithDrawer
            items={pinnedItems}
            collections={userCollections}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
          />
        </section>
      )}

      {/* Recent items */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Recent Items
          </h2>
          <Link
            href="/items"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <ItemGridWithDrawer
          items={recentItems}
          collections={userCollections}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        />
      </section>
    </div>
  );
}