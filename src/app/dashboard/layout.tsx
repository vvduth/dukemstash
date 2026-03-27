import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { auth } from '@/auth';
import { getSystemItemTypes } from '@/lib/db/items';
import { getFavoriteCollections, getSidebarRecentCollections } from '@/lib/db/collections';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userId = session.user.id;

  const [itemTypes, favoriteCollections, recentCollections] = await Promise.all([
    getSystemItemTypes(),
    getFavoriteCollections(userId),
    getSidebarRecentCollections(userId, 4),
  ]);

  const sidebarData = {
    itemTypes,
    favoriteCollections,
    recentCollections,
    user: { name: session.user.name ?? 'User', email: session.user.email!, image: session.user.image ?? null },
  };

  return <DashboardShell sidebarData={sidebarData} itemTypes={itemTypes}>{children}</DashboardShell>;
}