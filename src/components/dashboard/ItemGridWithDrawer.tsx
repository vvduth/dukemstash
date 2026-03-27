"use client";

import { useState } from "react";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ImageCard } from "@/components/dashboard/ImageCard";
import { FileListRow } from "@/components/dashboard/FileListRow";
import { ItemDrawer } from "@/components/dashboard/ItemDrawer";
import type { DashboardItem } from "@/lib/db/items";

interface ItemGridWithDrawerProps {
  items: DashboardItem[];
  className?: string;
}

export function ItemGridWithDrawer({
  items: initialItems,
  className,
}: ItemGridWithDrawerProps) {
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
      <div className={className}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleItemClick(item.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {item.type.name === "image" ? (
              <ImageCard item={item} />
            ) : item.type.name === "file" ? (
              <FileListRow item={item} />
            ) : (
              <ItemCard item={item} />
            )}
          </div>
        ))}
      </div>
      <ItemDrawer
        itemId={selectedItemId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onDeleted={handleDeleted}
      />
    </>
  );
}
