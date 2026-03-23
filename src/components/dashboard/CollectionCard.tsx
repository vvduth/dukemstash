import Link from 'next/link';
import {
  Star,
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link as LinkIcon,
  File,
  Image,
} from 'lucide-react';
import type { DashboardCollection } from '@/lib/db/collections';

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link: LinkIcon,
  File,
  Image,
};

export function CollectionCard({ collection }: { collection: DashboardCollection }) {
  return (
    <Link href={`/collections/${collection.id}`}>
      <div
        className="group rounded-lg border bg-card p-4 hover:bg-card/80 transition-colors h-full flex flex-col gap-2 cursor-pointer"
        style={{
          borderColor: collection.dominantColor
            ? `${collection.dominantColor}40`
            : undefined,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground text-sm leading-snug">
            {collection.name}
          </h3>
          {collection.isFavorite && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-500 text-yellow-500 mt-0.5" />
          )}
        </div>

        {collection.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
            {collection.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1">
            {collection.types.slice(0, 4).map((type) => {
              const Icon = ICON_MAP[type.icon];
              return Icon ? (
                <Icon
                  key={type.name}
                  className="h-3 w-3"
                  style={{ color: type.color }}
                  aria-label={type.name}
                />
              ) : null;
            })}
          </div>
          <span className="text-xs text-muted-foreground">
            {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
    </Link>
  );
}