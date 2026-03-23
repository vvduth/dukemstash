import Link from 'next/link';
import { Star } from 'lucide-react';
import { mockItemTypes } from '@/lib/mock-data';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  typeIds: string[];
}

export function CollectionCard({ collection }: { collection: Collection }) {
  const types = collection.typeIds
    .map((id) => mockItemTypes.find((t) => t.id === id))
    .filter(Boolean) as typeof mockItemTypes;

  return (
    <Link href={`/collections/${collection.id}`}>
      <div className="group rounded-lg border border-border bg-card p-4 hover:border-border/80 hover:bg-card/80 transition-colors h-full flex flex-col gap-2 cursor-pointer">
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
            {types.slice(0, 4).map((type) => (
              <span
                key={type.id}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: type.color }}
                title={type.name}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {collection.itemCount} items
          </span>
        </div>
      </div>
    </Link>
  );
}