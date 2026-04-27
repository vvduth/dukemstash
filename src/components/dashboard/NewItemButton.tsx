"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateItemDialog } from "./CreateItemDialog";
import type { SystemItemType } from "@/lib/db/items";
import type { UserCollection } from "@/lib/db/collections";

interface NewItemButtonProps {
  typeName: string;
  itemType: { id: string };
  allItemTypes: SystemItemType[];
  collections: UserCollection[];
  isPro?: boolean;
}

export function NewItemButton({
  typeName,
  itemType,
  allItemTypes,
  collections,
  isPro = false,
}: NewItemButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1.5" />
        New {typeName}
      </Button>
      <CreateItemDialog
        open={open}
        onOpenChange={setOpen}
        itemTypes={allItemTypes}
        collections={collections}
        defaultTypeId={itemType.id}
        isPro={isPro}
      />
    </>
  );
}
