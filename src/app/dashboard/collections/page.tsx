import { connection } from 'next/server';
import { auth } from '@/auth';
import { getAllCollections } from '@/lib/db/collections';
import { CollectionCard } from '@/components/dashboard/CollectionCard';
import { PaginationControls } from '@/components/dashboard/PaginationControls';
import { COLLECTIONS_PER_PAGE } from '@/lib/constants/pagination';
import { FolderOpen } from 'lucide-react';

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();
  const { page: pageParam } = await searchParams;

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const { collections, totalCount, totalPages } = await getAllCollections(userId, currentPage, COLLECTIONS_PER_PAGE);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <FolderOpen className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">Collections</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'collection' : 'collections'}
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

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/dashboard/collections"
      />
    </div>
  );
}
