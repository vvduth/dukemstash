import { Package, FolderOpen, Star, BookMarked } from 'lucide-react';

interface StatsCardsProps {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

const stats = [
  {
    key: 'totalItems',
    label: 'Total Items',
    icon: Package,
    color: '#3b82f6',
  },
  {
    key: 'totalCollections',
    label: 'Collections',
    icon: FolderOpen,
    color: '#10b981',
  },
  {
    key: 'favoriteItems',
    label: 'Favorite Items',
    icon: Star,
    color: '#f59e0b',
  },
  {
    key: 'favoriteCollections',
    label: 'Fav Collections',
    icon: BookMarked,
    color: '#8b5cf6',
  },
] as const;

export function StatsCards({
  totalItems,
  totalCollections,
  favoriteItems,
  favoriteCollections,
}: StatsCardsProps) {
  const values: Record<string, number> = {
    totalItems,
    totalCollections,
    favoriteItems,
    favoriteCollections,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="rounded-lg border border-border bg-card p-4 flex items-center gap-3"
        >
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">
              {values[key]}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}