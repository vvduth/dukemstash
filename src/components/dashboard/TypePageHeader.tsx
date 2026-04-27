"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateItemDialog } from "./CreateItemDialog";
import { ICON_MAP } from "@/lib/constants/icon-map";
import type { IconName } from "@/lib/constants/icon-map";
import type { SystemItemType } from "@/lib/db/items";
import type { UserCollection } from "@/lib/db/collections";

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
  const [createOpen, setCreateOpen] = useState(false);
  const Icon = ICON_MAP[itemType.icon as IconName];

  return (
    <>
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
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New {typeName}
        </Button>
      </div>
      <CreateItemDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        itemTypes={allItemTypes}
        collections={collections}
        defaultTypeId={itemType.id}
        isPro={isPro}
      />
    </>
  );
}
