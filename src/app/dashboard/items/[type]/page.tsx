import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getItemsByType, getSystemItemTypes } from '@/lib/db/items';
import { getUserCollections } from '@/lib/db/collections';
import { ItemGridWithDrawer } from '@/components/dashboard/ItemGridWithDrawer';
import { TypePageHeader } from '@/components/dashboard/TypePageHeader';
import { PaginationControls } from '@/components/dashboard/PaginationControls';
import { ITEMS_PER_PAGE } from '@/lib/constants/pagination';

const VALID_TYPES = ['snippet', 'prompt', 'note', 'command', 'link', 'file', 'image'] as const;

function singularize(plural: string): string {
  return plural.endsWith('s') ? plural.slice(0, -1) : plural;
}

export default async function ItemsTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();
  const { type: typeSlug } = await params;
  const { page: pageParam } = await searchParams;
  const typeName = singularize(typeSlug);

  if (!VALID_TYPES.includes(typeName as (typeof VALID_TYPES)[number])) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const [{ items, totalCount, totalPages }, itemType, allItemTypes, userCollections] = await Promise.all([
    getItemsByType(userId, typeName, currentPage, ITEMS_PER_PAGE),
    prisma.itemType.findFirst({ where: { name: typeName, isSystem: true } }),
    getSystemItemTypes(),
    getUserCollections(userId),
  ]);

  if (!itemType) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <TypePageHeader
        typeSlug={typeSlug}
        typeName={typeName}
        itemCount={totalCount}
        itemType={itemType}
        allItemTypes={allItemTypes}
        collections={userCollections}
      />

      {/* Items grid/list */}
      {items.length > 0 ? (
        typeName === 'file' ? (
          <div>
            <div className="flex items-center gap-4 px-4 py-2 text-xs text-muted-foreground border-b mb-2">
              <span className="w-5 shrink-0" />
              <span className="flex-1 min-w-0">Name</span>
              <span className="hidden md:block w-20 text-right shrink-0">Size</span>
              <span className="hidden md:block w-28 text-right shrink-0">Uploaded</span>
              <span className="w-8 shrink-0" />
            </div>
            <ItemGridWithDrawer
              items={items}
              collections={userCollections}
              className="flex flex-col gap-2"
            />
          </div>
        ) : (
          <ItemGridWithDrawer
            items={items}
            collections={userCollections}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          />
        )
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            No {typeSlug} yet. Create your first one!
          </p>
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/dashboard/items/${typeSlug}`}
      />
    </div>
  );
}
