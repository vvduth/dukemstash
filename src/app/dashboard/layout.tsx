import { connection } from 'next/server';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { prisma } from '@/lib/prisma';
import { getSystemItemTypes } from '@/lib/db/items';
import { getFavoriteCollections, getSidebarRecentCollections } from '@/lib/db/collections';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  // TODO: Replace with real auth user when auth is implemented
  const user = await prisma.user.findFirst();

  const [itemTypes, favoriteCollections, recentCollections] = user
    ? await Promise.all([
        getSystemItemTypes(),
        getFavoriteCollections(user.id),
        getSidebarRecentCollections(user.id, 4),
      ])
    : [[], [], []];

  const sidebarData = {
    itemTypes,
    favoriteCollections,
    recentCollections,
    user: user ? { name: user.name ?? 'User', email: user.email } : null,
  };

  return <DashboardShell sidebarData={sidebarData}>{children}</DashboardShell>;
}