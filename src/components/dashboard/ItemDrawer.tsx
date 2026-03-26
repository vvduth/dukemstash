"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ICON_MAP } from "@/lib/constants/icon-map";
import type { IconName } from "@/lib/constants/icon-map";
import type { ItemDetail } from "@/lib/db/items";
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
} from "lucide-react";

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchItem = useCallback(async (id: string) => {
    setLoading(true);
    setItem(null);
    try {
      const res = await fetch(`/api/items/${id}`);
      if (res.ok) {
        const data = await res.json();
        setItem(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && itemId) {
      fetchItem(itemId);
    }
    if (!open) {
      setItem(null);
    }
  }, [open, itemId, fetchItem]);

  const TypeIcon = item
    ? ICON_MAP[item.type.icon as IconName] ?? null
    : null;

  const handleCopy = async () => {
    const text = item?.content ?? item?.url ?? "";
    if (text) {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        {loading ? (
          <DrawerSkeleton />
        ) : item ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="pr-8">
              <div className="flex items-center gap-2">
                {TypeIcon && (
                  <TypeIcon
                    className="h-4 w-4 shrink-0"
                    style={{ color: item.type.color }}
                  />
                )}
                <SheetTitle className="text-lg">{item.title}</SheetTitle>
              </div>
              {/* Type & language badges */}
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs font-medium capitalize px-2 py-0.5 rounded-full"
                  style={{
                    color: item.type.color,
                    backgroundColor: `${item.type.color}15`,
                  }}
                >
                  {item.type.name}
                </span>
                {item.language && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </div>
            </SheetHeader>

            {/* Description */}
            {item.description && (
              <div className="px-4 pb-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Description
                </h4>
                <p className="text-sm text-foreground">{item.description}</p>
              </div>
            )}

            {/* Content */}
            <div className="px-4 pb-4 flex-1 min-h-0">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Content
              </h4>
              {item.contentType === "URL" && item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline break-all"
                >
                  {item.url}
                </a>
              ) : item.content ? (
                <pre className="text-xs font-mono bg-muted/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words max-h-[50vh]">
                  {item.content}
                </pre>
              ) : item.fileName ? (
                <p className="text-sm text-muted-foreground">
                  {item.fileName}
                  {item.fileSize
                    ? ` (${(item.fileSize / 1024).toFixed(1)} KB)`
                    : ""}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No content
                </p>
              )}
            </div>

            {/* Collections */}
            {item.collections.length > 0 && (
              <div className="px-4 pb-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Collections
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {item.collections.map((col) => (
                    <span
                      key={col.id}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {col.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="px-4 pb-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action bar */}
            <div className="mt-auto border-t px-4 py-3 flex items-center gap-1">
              <button
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title={item.isFavorite ? "Unfavorite" : "Favorite"}
              >
                <Star
                  className={`h-4 w-4 ${
                    item.isFavorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
              <button
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title={item.isPinned ? "Unpin" : "Pin"}
              >
                <Pin
                  className={`h-4 w-4 ${
                    item.isPinned
                      ? "fill-muted-foreground text-muted-foreground"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="Copy content"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="Edit"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="ml-auto">
                <button
                  className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <SheetDescription className="text-muted-foreground">
              Item not found
            </SheetDescription>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
      </div>
    </div>
  );
}
