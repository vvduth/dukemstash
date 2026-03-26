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

      {/* Items grid */}
      {items.length > 0 ? (
        <ItemGridWithDrawer
          items={items}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        />
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
