'use client';

import { useState } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { CreateItemDialog } from './CreateItemDialog';
import type { SidebarData } from './Sidebar';
import type { SystemItemType } from '@/lib/db/items';

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
  itemTypes: SystemItemType[];
}

export function DashboardShell({ children, sidebarData, itemTypes }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <TopBar
        onMenuClick={() => setIsMobileOpen(true)}
        onNewItem={() => setCreateOpen(true)}
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
      />
    </div>
  );
}
