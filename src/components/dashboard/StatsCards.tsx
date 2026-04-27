import Link from 'next/link';
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
    href: '/dashboard/items',
  },
  {
    key: 'totalCollections',
    label: 'Collections',
    icon: FolderOpen,
    color: '#10b981',
    href: '/dashboard/collections',
  },
  {
    key: 'favoriteItems',
    label: 'Favorite Items',
    icon: Star,
    color: '#f59e0b',
    href: '/dashboard/favorites',
  },
  {
    key: 'favoriteCollections',
    label: 'Fav Collections',
    icon: BookMarked,
    color: '#8b5cf6',
    href: '/dashboard/favorites',
  },
] as const;

export function StatsCards({
  totalItems,
  totalCollections,
  favoriteItems,
  favoriteCollections,
}: StatsCardsProps) {
  const values: StatsCardsProps = {
    totalItems,
    totalCollections,
    favoriteItems,
    favoriteCollections,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ key, label, icon: Icon, color, href }) => (
        <Link
          key={key}
          href={href}
          className="rounded-lg border border-border bg-card p-4 flex items-center gap-3 hover:bg-card/80 hover:border-border/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">
              {values[key as keyof StatsCardsProps]}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}