"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
}

interface CollectionPickerProps {
  collections: Collection[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function CollectionPicker({
  collections,
  selectedIds,
  onChange,
  disabled,
}: CollectionPickerProps) {
  const [open, setOpen] = useState(false);

  const toggleCollection = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedNames = collections
    .filter((c) => selectedIds.includes(c.id))
    .map((c) => c.name);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
      >
        <span className="truncate text-left">
          {selectedNames.length > 0
            ? selectedNames.join(", ")
            : <span className="text-muted-foreground">Select collections...</span>}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        {collections.length === 0 ? (
          <p className="py-3 px-3 text-sm text-muted-foreground">
            No collections yet
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto p-1">
            {collections.map((col) => {
              const isSelected = selectedIds.includes(col.id);
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => toggleCollection(col.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                    isSelected && "bg-accent/50"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    className="pointer-events-none"
                    tabIndex={-1}
                  />
                  <span className="truncate">{col.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
