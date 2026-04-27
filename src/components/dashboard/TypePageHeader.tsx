"use client";

import { ICON_MAP } from "@/lib/constants/icon-map";
import type { IconName } from "@/lib/constants/icon-map";
import type { SystemItemType } from "@/lib/db/items";
import type { UserCollection } from "@/lib/db/collections";
import { NewItemButton } from "./NewItemButton";

interface TypePageHeaderProps {
  typeSlug: string;
  typeName: string;
  itemCount: number;
  itemType: { icon: string; color: string; id: string };
  allItemTypes: SystemItemType[];
  collections: UserCollection[];
  isPro?: boolean;
}

export function TypePageHeader({
  typeSlug,
  typeName,
  itemCount,
  itemType,
  allItemTypes,
  collections,
  isPro = false,
}: TypePageHeaderProps) {
  const Icon = ICON_MAP[itemType.icon as IconName];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon className="h-6 w-6" style={{ color: itemType.color }} />
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground capitalize">
            {typeSlug}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {itemCount} {itemCount === 1 ? typeName : typeSlug}
          </p>
        </div>
      </div>
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
