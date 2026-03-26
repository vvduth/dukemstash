import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getItemsByType } from '@/lib/db/items';
import { ItemCard } from '@/components/dashboard/ItemCard';
import { ICON_MAP } from '@/lib/constants/icon-map';
import type { IconName } from '@/lib/constants/icon-map';

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

  const [items, itemType] = await Promise.all([
    getItemsByType(user.id, typeName),
    prisma.itemType.findFirst({ where: { name: typeName, isSystem: true } }),
  ]);

  if (!itemType) {
    notFound();
  }

  const Icon = ICON_MAP[itemType.icon as IconName];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon className="h-6 w-6" style={{ color: itemType.color }} />
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground capitalize">
            {typeSlug}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} {items.length === 1 ? typeName : typeSlug}
          </p>
        </div>
      </div>

      {/* Items grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
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
