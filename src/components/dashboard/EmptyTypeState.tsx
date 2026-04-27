'use client';

import { ICON_MAP } from '@/lib/constants/icon-map';
import type { IconName } from '@/lib/constants/icon-map';
import type { SystemItemType } from '@/lib/db/items';
import type { UserCollection } from '@/lib/db/collections';
import { NewItemButton } from './NewItemButton';

interface EmptyTypeStateProps {
  typeSlug: string;
  typeName: string;
  itemType: { icon: string; color: string; id: string };
  allItemTypes: SystemItemType[];
  collections: UserCollection[];
  isPro?: boolean;
}

export function EmptyTypeState({
  typeSlug,
  typeName,
  itemType,
  allItemTypes,
  collections,
  isPro = false,
}: EmptyTypeStateProps) {
  const Icon = ICON_MAP[itemType.icon as IconName];

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
      {Icon && (
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${itemType.color}20` }}
        >
          <Icon className="h-6 w-6" style={{ color: itemType.color }} />
        </div>
      )}
      <p className="text-muted-foreground text-sm">
        No {typeSlug} yet. Create your first one to get started.
      </p>
      <NewItemButton
        typeName={typeName}
        itemType={itemType}
        allItemTypes={allItemTypes}
        collections={collections}
        isPro={isPro}
      />
    </div>
  );
}
