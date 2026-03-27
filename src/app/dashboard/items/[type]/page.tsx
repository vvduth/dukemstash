import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getItemsByType, getSystemItemTypes } from '@/lib/db/items';
import { ItemGridWithDrawer } from '@/components/dashboard/ItemGridWithDrawer';
import { TypePageHeader } from '@/components/dashboard/TypePageHeader';

const VALID_TYPES = ['snippet', 'prompt', 'note', 'command', 'link', 'file', 'image'] as const;

function singularize(plural: string): string {
  return plural.endsWith('s') ? plural.slice(0, -1) : plural;
}

export default async function ItemsTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  await connection();
  const { type: typeSlug } = await params;
  const typeName = singularize(typeSlug);

  if (!VALID_TYPES.includes(typeName as (typeof VALID_TYPES)[number])) {
    notFound();
  }

  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;

  if (!user) {
    notFound();
  }

  const [items, itemType, allItemTypes] = await Promise.all([
    getItemsByType(user.id, typeName),
    prisma.itemType.findFirst({ where: { name: typeName, isSystem: true } }),
    getSystemItemTypes(),
  ]);

  if (!itemType) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <TypePageHeader
        typeSlug={typeSlug}
        typeName={typeName}
        itemCount={items.length}
        itemType={itemType}
        allItemTypes={allItemTypes}
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
              className="flex flex-col gap-2"
            />
          </div>
        ) : (
          <ItemGridWithDrawer
            items={items}
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
    </div>
  );
}
