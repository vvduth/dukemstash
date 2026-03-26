import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { prisma } from '@/lib/prisma';
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
  if (!session?.user) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

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
    user: user ? { name: user.name ?? 'User', email: user.email, image: user.image } : null,
  };

  return <DashboardShell sidebarData={sidebarData} itemTypes={itemTypes}>{children}</DashboardShell>;
}