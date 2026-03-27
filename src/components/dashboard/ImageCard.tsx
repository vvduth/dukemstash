'use client';

import { useState } from 'react';
import { Pin, Copy, Check } from 'lucide-react';
import type { DashboardItem } from '@/lib/db/items';

export function ImageCard({ item }: { item: DashboardItem }) {
  const [copied, setCopied] = useState(false);
  const imageUrl = item.fileUrl
    ? `/api/files/${encodeURIComponent(item.fileUrl)}`
    : null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl) return;
    navigator.clipboard.writeText(window.location.origin + imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group/card rounded-lg border bg-card overflow-hidden hover:bg-card/80 transition-colors cursor-pointer h-full flex flex-col"
      style={{ borderColor: `${item.type.color}40` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted/30">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No preview
          </div>
        )}
        {imageUrl && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity p-1.5 rounded-md bg-black/50 text-white hover:bg-black/70"
            aria-label="Copy image URL"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground text-sm leading-snug truncate">
            {item.title}
          </h3>
          {item.isPinned && (
            <Pin className="h-3 w-3 text-muted-foreground fill-muted-foreground shrink-0 ml-2" />
          )}
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
