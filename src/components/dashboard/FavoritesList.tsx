'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FolderOpen, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ICON_MAP, type IconName } from '@/lib/constants/icon-map';
import { ItemDrawer } from '@/components/dashboard/ItemDrawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DashboardItem } from '@/lib/db/items';
import type { FavoriteCollectionDetail } from '@/lib/db/collections';
import type { UserCollection } from '@/lib/db/collections';

type SortDirection = 'asc' | 'desc';
type ItemSortField = 'name' | 'date' | 'type';
type CollectionSortField = 'name' | 'date';

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

function SortControls<T extends string>({
  sortField,
  sortDirection,
  onSortFieldChange,
  onDirectionToggle,
  options,
}: {
  sortField: T;
  sortDirection: SortDirection;
  onSortFieldChange: (field: T) => void;
  onDirectionToggle: () => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Select value={sortField} onValueChange={(v) => onSortFieldChange(v as T)}>
        <SelectTrigger className="h-7 text-xs w-27.5 bg-transparent border-border">
          <ArrowUpDown className="h-3 w-3 mr-1 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={onDirectionToggle}
        className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted/50 transition-colors"
        title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
      >
        {sortDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ArrowDown className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

const ITEM_SORT_OPTIONS: { value: ItemSortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'type', label: 'Type' },
];

const COLLECTION_SORT_OPTIONS: { value: CollectionSortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
];

export function FavoritesList({
  items: initialItems,
  collections,
  userCollections,
}: FavoritesListProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [itemSortField, setItemSortField] = useState<ItemSortField>('name');
  const [itemSortDir, setItemSortDir] = useState<SortDirection>('asc');
  const [colSortField, setColSortField] = useState<CollectionSortField>('name');
  const [colSortDir, setColSortDir] = useState<SortDirection>('asc');

  const sortedItems = useMemo(() => {
    const sorted = [...items];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (itemSortField) {
        case 'name':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'date':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'type':
          cmp = a.type.name.localeCompare(b.type.name);
          break;
      }
      return itemSortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [items, itemSortField, itemSortDir]);

  const sortedCollections = useMemo(() => {
    const sorted = [...collections];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (colSortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'date':
          cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return colSortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [collections, colSortField, colSortDir]);

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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Items
              </h2>
              <span className="text-xs text-muted-foreground">({items.length})</span>
            </div>
            <SortControls
              sortField={itemSortField}
              sortDirection={itemSortDir}
              onSortFieldChange={setItemSortField}
              onDirectionToggle={() => setItemSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              options={ITEM_SORT_OPTIONS}
            />
          </div>
          <div className="border border-border rounded-md divide-y divide-border">
            {sortedItems.map((item) => {
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Collections
              </h2>
              <span className="text-xs text-muted-foreground">({collections.length})</span>
            </div>
            <SortControls
              sortField={colSortField}
              sortDirection={colSortDir}
              onSortFieldChange={setColSortField}
              onDirectionToggle={() => setColSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              options={COLLECTION_SORT_OPTIONS}
            />
          </div>
          <div className="border border-border rounded-md divide-y divide-border">
            {sortedCollections.map((col) => (
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
