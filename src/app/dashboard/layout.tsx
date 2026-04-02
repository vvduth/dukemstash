import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { auth } from '@/auth';
import { getSystemItemTypes, getSearchItems } from '@/lib/db/items';
import { getFavoriteCollections, getSidebarRecentCollections, getUserCollections, getSearchCollections } from '@/lib/db/collections';

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

  const [itemTypes, favoriteCollections, recentCollections, userCollections, searchItems, searchCollections] = await Promise.all([
    getSystemItemTypes(),
    getFavoriteCollections(userId),
    getSidebarRecentCollections(userId, 4),
    getUserCollections(userId),
    getSearchItems(userId),
    getSearchCollections(userId),
  ]);

  const sidebarData = {
    itemTypes,
    favoriteCollections,
    recentCollections,
    user: { name: session.user.name ?? 'User', email: session.user.email!, image: session.user.image ?? null },
  };

  return <DashboardShell sidebarData={sidebarData} itemTypes={itemTypes} collections={userCollections} searchItems={searchItems} searchCollections={searchCollections}>{children}</DashboardShell>;
}