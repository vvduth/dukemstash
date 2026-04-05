import { connection } from 'next/server';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import { getFavoriteItems } from '@/lib/db/items';
import { getFavoriteCollectionsWithDetails } from '@/lib/db/collections';
import { getUserCollections } from '@/lib/db/collections';
import { FavoritesList } from '@/components/dashboard/FavoritesList';
import { Star } from 'lucide-react';

export default async function FavoritesPage() {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const [favoriteItems, favoriteCollections, userCollections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollectionsWithDetails(userId),
    getUserCollections(userId),
  ]);

  const hasAny = favoriteItems.length > 0 || favoriteCollections.length > 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <h1 className="text-xl font-semibold">Favorites</h1>
      </div>

      {!hasAny ? (
        <div className="text-center py-16">
          <Star className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No favorites yet. Star items or collections to see them here.
          </p>
        </div>
      ) : (
        <FavoritesList
          items={favoriteItems}
          collections={favoriteCollections}
          userCollections={userCollections}
        />
      )}
    </div>
  );
}
