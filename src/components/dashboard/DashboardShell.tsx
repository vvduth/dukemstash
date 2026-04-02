'use client';

import { useState, useCallback } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { CreateItemDialog } from './CreateItemDialog';
import { CreateCollectionDialog } from './CreateCollectionDialog';
import { CommandPalette } from './CommandPalette';
import { ItemDrawer } from './ItemDrawer';
import type { SidebarData } from './Sidebar';
import type { SystemItemType, SearchItem } from '@/lib/db/items';
import type { UserCollection, SearchCollection } from '@/lib/db/collections';

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
  itemTypes: SystemItemType[];
  collections: UserCollection[];
  searchItems: SearchItem[];
  searchCollections: SearchCollection[];
}

export function DashboardShell({ children, sidebarData, itemTypes, collections, searchItems, searchCollections }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerItemId, setDrawerItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelectItem = useCallback((itemId: string) => {
    setDrawerItemId(itemId);
    setDrawerOpen(true);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <TopBar
        onMenuClick={() => setIsMobileOpen(true)}
        onNewItem={() => setCreateOpen(true)}
        onNewCollection={() => setCreateCollectionOpen(true)}
        onSearchClick={() => setPaletteOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          onMobileClose={() => setIsMobileOpen(false)}
          data={sidebarData}
        />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
      <CreateItemDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        itemTypes={itemTypes}
        collections={collections}
      />
      <CreateCollectionDialog
        open={createCollectionOpen}
        onOpenChange={setCreateCollectionOpen}
      />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        items={searchItems}
        collections={searchCollections}
        onSelectItem={handleSelectItem}
      />
      <ItemDrawer
        itemId={drawerItemId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        collections={collections}
      />
    </div>
  );
}
