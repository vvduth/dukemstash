"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { ICON_MAP } from "@/lib/constants/icon-map";
import type { IconName } from "@/lib/constants/icon-map";
import type { SearchItem } from "@/lib/db/items";
import type { SearchCollection } from "@/lib/db/collections";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SearchItem[];
  collections: SearchCollection[];
  onSelectItem: (itemId: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
  collections,
  onSelectItem,
}: CommandPaletteProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleSelectItem = useCallback(
    (itemId: string) => {
      onOpenChange(false);
      onSelectItem(itemId);
    },
    [onOpenChange, onSelectItem]
  );

  const handleSelectCollection = useCallback(
    (collectionId: string) => {
      onOpenChange(false);
      router.push(`/dashboard/collections/${collectionId}`);
    },
    [onOpenChange, router]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search items and collections"
    >
      <Command className="rounded-xl border-0">
        <CommandInput placeholder="Search items and collections..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {items.length > 0 && (
            <CommandGroup heading="Items">
              {items.map((item) => {
                const Icon = ICON_MAP[item.type.icon as IconName];
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.type.name} ${item.preview ?? ""}`}
                    onSelect={() => handleSelectItem(item.id)}
                  >
                    {Icon && (
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: item.type.color }}
                      />
                    )}
                    <span className="truncate">{item.title}</span>
                    {item.preview && (
                      <span className="ml-auto truncate text-xs text-muted-foreground max-w-[200px]">
                        {item.preview}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
          {items.length > 0 && collections.length > 0 && <CommandSeparator />}
          {collections.length > 0 && (
            <CommandGroup heading="Collections">
              {collections.map((col) => (
                <CommandItem
                  key={col.id}
                  value={`${col.name} collection`}
                  onSelect={() => handleSelectCollection(col.id)}
                >
                  <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{col.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
