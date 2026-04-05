'use client';

import Link from 'next/link';
import { Search, Plus, Menu, FolderPlus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  onMenuClick?: () => void;
  onNewItem?: () => void;
  onNewCollection?: () => void;
  onSearchClick?: () => void;
}

export function TopBar({ onMenuClick, onNewItem, onNewCollection, onSearchClick }: TopBarProps) {
  return (
    <header className="h-14 border-b border-border bg-background flex items-center gap-3 px-4 shrink-0">
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
      <span className="font-semibold text-foreground mr-2">Dukemstash</span>

      <button
        type="button"
        onClick={onSearchClick}
        className="flex-1 max-w-md relative flex items-center"
      >
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <div className="w-full pl-9 pr-9 h-8 bg-muted rounded-md text-sm text-muted-foreground flex items-center cursor-pointer hover:bg-muted/80 transition-colors">
          Search...
        </div>
        <kbd className="absolute right-2 pointer-events-none hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/dashboard/favorites"
          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Star className="h-4 w-4" />
        </Link>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onNewCollection}>
          <FolderPlus className="h-4 w-4" />
          <span className="hidden sm:inline">New Collection</span>
        </Button>
        <Button size="sm" className="gap-1.5" onClick={onNewItem}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
