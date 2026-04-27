import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Package } from 'lucide-react';
import { auth } from '@/auth';
import { getAllItems } from '@/lib/db/items';
import { getUserCollections } from '@/lib/db/collections';
import { ItemGridWithDrawer } from '@/components/dashboard/ItemGridWithDrawer';
import { PaginationControls } from '@/components/dashboard/PaginationControls';
import { ITEMS_PER_PAGE } from '@/lib/constants/pagination';

export default async function AllItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();
  const { page: pageParam } = await searchParams;

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const isPro = session.user.isPro || process.env.BYPASS_PRO_CHECKS === 'true';
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const [{ items, totalCount, totalPages }, userCollections] = await Promise.all([
    getAllItems(userId, currentPage, ITEMS_PER_PAGE),
    getUserCollections(userId),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Items</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <ItemGridWithDrawer
          items={items}
          collections={userCollections}
          isPro={isPro}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        />
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            No items yet. Use the New Item button above to create one.
          </p>
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/dashboard/items"
      />
    </div>
  );
}
