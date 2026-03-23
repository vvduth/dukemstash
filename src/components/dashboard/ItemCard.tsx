import {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link as LinkIcon,
  File,
  Image,
  Pin,
} from 'lucide-react';
import { mockItemTypes } from '@/lib/mock-data';

const ICON_MAP = {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link: LinkIcon,
  File,
  Image,
} as const;

interface Item {
  id: string;
  title: string;
  description: string | null;
  content?: string | null;
  url?: string | null;
  contentType: 'TEXT' | 'URL' | 'FILE';
  language?: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  itemTypeId: string;
  tags: string[];
}

export function ItemCard({ item }: { item: Item }) {
  const type = mockItemTypes.find((t) => t.id === item.itemTypeId);
  const Icon = type ? ICON_MAP[type.icon as keyof typeof ICON_MAP] : null;

  const preview =
    item.contentType === 'URL'
      ? item.url
      : item.description ?? item.content?.slice(0, 120);

  return (
    <div
      className="rounded-lg border bg-card p-4 flex flex-col gap-2 hover:bg-card/80 transition-colors cursor-pointer h-full"
      style={{ borderColor: type ? `${type.color}40` : undefined }}
    >
      {/* Type badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Icon && type && (
            <Icon className="h-3.5 w-3.5" style={{ color: type.color }} />
          )}
          {type && (
            <span
              className="text-xs font-medium capitalize"
              style={{ color: type.color }}
            >
              {type.name}
            </span>
          )}
        </div>
        {item.isPinned && (
          <Pin className="h-3 w-3 text-muted-foreground fill-muted-foreground" />
        )}
      </div>

      {/* Title */}
      <h3 className="font-medium text-foreground text-sm leading-snug">
        {item.title}
      </h3>

      {/* Preview */}
      {preview && (
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1 font-mono">
          {preview}
        </p>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
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
  );
}