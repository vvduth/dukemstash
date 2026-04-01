import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { auth } from '@/auth';
import { getCollectionWithItems, getUserCollections } from '@/lib/db/collections';
import { ItemGridWithDrawer } from '@/components/dashboard/ItemGridWithDrawer';
import { CollectionDetailHeader } from '@/components/dashboard/CollectionDetailHeader';

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const [collection, userCollections] = await Promise.all([
    getCollectionWithItems(id, userId),
    getUserCollections(userId),
  ]);

  if (!collection) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <CollectionDetailHeader collection={collection} />

      {collection.items.length > 0 ? (
        <ItemGridWithDrawer
          items={collection.items}
          collections={userCollections}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        />
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            This collection has no items yet. Add items from the item drawer.
          </p>
        </div>
      )}
    </div>
  );
}
