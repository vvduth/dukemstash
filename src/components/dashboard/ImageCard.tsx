import { Pin } from 'lucide-react';
import type { DashboardItem } from '@/lib/db/items';

export function ImageCard({ item }: { item: DashboardItem }) {
  const imageUrl = item.fileUrl
    ? `/api/files/${encodeURIComponent(item.fileUrl)}`
    : null;

  return (
    <div className="rounded-lg border bg-card overflow-hidden hover:bg-card/80 transition-colors cursor-pointer h-full flex flex-col"
      style={{ borderColor: `${item.type.color}40` }}
    >
      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden bg-muted/30">
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
