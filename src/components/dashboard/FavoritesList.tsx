'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderOpen } from 'lucide-react';
import { ICON_MAP, type IconName } from '@/lib/constants/icon-map';
import { ItemDrawer } from '@/components/dashboard/ItemDrawer';
import type { DashboardItem } from '@/lib/db/items';
import type { FavoriteCollectionDetail } from '@/lib/db/collections';
import type { UserCollection } from '@/lib/db/collections';

interface FavoritesListProps {
  items: DashboardItem[];
  collections: FavoriteCollectionDetail[];
  userCollections: UserCollection[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function FavoritesList({
  items: initialItems,
  collections,
  userCollections,
}: FavoritesListProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setDrawerOpen(true);
  };

  const handleDeleted = (deletedId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== deletedId));
  };

  return (
    <>
      {items.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Items
            </h2>
            <span className="text-xs text-muted-foreground">({items.length})</span>
          </div>
          <div className="border border-border rounded-md divide-y divide-border">
            {items.map((item) => {
              const Icon = ICON_MAP[item.type.icon as IconName];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors text-sm font-mono"
                >
                  {Icon && (
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: item.type.color }}
                    />
                  )}
                  <span className="flex-1 min-w-0 truncate text-foreground">
                    {item.title}
                  </span>
                  <span
                    className="shrink-0 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium"
                    style={{
                      color: item.type.color,
                      backgroundColor: `${item.type.color}15`,
                    }}
                  >
                    {item.type.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground hidden sm:block w-24 text-right">
                    {formatDate(item.createdAt)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Collections
            </h2>
            <span className="text-xs text-muted-foreground">({collections.length})</span>
          </div>
          <div className="border border-border rounded-md divide-y divide-border">
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => router.push(`/dashboard/collections/${col.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors text-sm font-mono"
              >
                <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 min-w-0 truncate text-foreground">
                  {col.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {col.itemCount} {col.itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground hidden sm:block w-24 text-right">
                  {formatDate(col.updatedAt)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <ItemDrawer
        itemId={selectedItemId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onDeleted={handleDeleted}
        collections={userCollections}
      />
    </>
  );
}
