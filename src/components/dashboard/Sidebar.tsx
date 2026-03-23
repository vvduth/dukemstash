'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link as LinkIcon,
  File,
  Image,
  Star,
  PanelLeft,
  PanelLeftClose,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { SystemItemType } from '@/lib/db/items';
import type { FavoriteCollection, SidebarCollection } from '@/lib/db/collections';

const ICON_MAP = {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link: LinkIcon,
  File,
  Image,
} as const;

export interface SidebarData {
  itemTypes: SystemItemType[];
  favoriteCollections: FavoriteCollection[];
  recentCollections: SidebarCollection[];
  user: { name: string; email: string } | null;
}

interface SidebarContentProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onToggleCollapse: () => void;
  onMobileClose: () => void;
  data: SidebarData;
}

function SidebarContent({
  isCollapsed,
  isMobile,
  onToggleCollapse,
  onMobileClose,
  data,
}: SidebarContentProps) {
  const pathname = usePathname();
  const collapsed = isMobile ? false : isCollapsed;

  return (
    <div className="flex flex-col h-full">
      {/* Header with toggle button */}
      <div
        className={cn(
          'flex items-center h-14 border-b border-sidebar-border shrink-0 px-2',
          collapsed ? 'justify-center' : 'justify-end'
        )}
      >
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Scrollable nav area */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {/* Types */}
        <div>
          {!collapsed && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 px-2">
              Types
            </p>
          )}
          <ul className="space-y-0.5">
            {data.itemTypes.map((type) => {
              const Icon = ICON_MAP[type.icon as keyof typeof ICON_MAP];
              const href = `/items/${type.name}s`;
              const isActive = pathname === href;
              return (
                <li key={type.id}>
                  <Link
                    href={href}
                    title={collapsed ? type.name : undefined}
                    className={cn(
                      'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
                      'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                      collapsed && 'justify-center'
                    )}
                  >
                    {Icon && (
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: type.color }}
                      />
                    )}
                    {!collapsed && (
                      <span className="capitalize">{type.name}s</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Favorites */}
        {!collapsed && data.favoriteCollections.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 px-2">
              Favorites
            </p>
            <ul className="space-y-0.5">
              {data.favoriteCollections.map((col) => (
                <li key={col.id}>
                  <Link
                    href={`/collections/${col.id}`}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <Star className="h-4 w-4 shrink-0 fill-yellow-500 text-yellow-500" />
                    <span className="truncate">{col.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent */}
        {!collapsed && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 px-2">
              Recent
            </p>
            <ul className="space-y-0.5">
              {data.recentCollections.map((col) => (
                <li key={col.id}>
                  <Link
                    href={`/collections/${col.id}`}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{
                        backgroundColor: col.dominantColor ?? '#6b7280',
                      }}
                    />
                    <span className="truncate">{col.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/collections"
              className="block px-2 py-1.5 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all collections
            </Link>
          </div>
        )}
      </nav>

      {/* User avatar area */}
      <div
        className={cn(
          'border-t border-sidebar-border p-3 shrink-0',
          collapsed ? 'flex justify-center' : 'flex items-center gap-3'
        )}
      >
        <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-semibold shrink-0">
          {data.user?.name?.charAt(0) ?? 'U'}
        </div>
        {!collapsed && data.user && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {data.user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {data.user.email}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onMobileClose: () => void;
  data: SidebarData;
}

export function Sidebar({
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onMobileClose,
  data,
}: SidebarProps) {
  return (
    <>
      {/* Desktop inline sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar shrink-0 transition-[width] duration-200',
          isCollapsed ? 'w-14' : 'w-60'
        )}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          isMobile={false}
          onToggleCollapse={onToggleCollapse}
          onMobileClose={onMobileClose}
          data={data}
        />
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar border-r border-sidebar-border lg:hidden">
            <SidebarContent
              isCollapsed={false}
              isMobile={true}
              onToggleCollapse={onToggleCollapse}
              onMobileClose={onMobileClose}
              data={data}
            />
          </aside>
        </>
      )}
    </>
  );
}