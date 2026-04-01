import { connection } from 'next/server';
import { auth } from '@/auth';
import { getAllCollections } from '@/lib/db/collections';
import { CollectionCard } from '@/components/dashboard/CollectionCard';
import { FolderOpen } from 'lucide-react';

export default async function CollectionsPage() {
  await connection();

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const collections = await getAllCollections(userId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <FolderOpen className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">Collections</h1>
          <p className="text-sm text-muted-foreground">
            {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
          </p>
        </div>
      </div>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            No collections yet. Create your first one!
          </p>
        </div>
      )}
    </div>
  );
}
