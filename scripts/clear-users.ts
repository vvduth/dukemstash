import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const DEMO_EMAIL = "demo@devstash.io";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Clearing users and resetting demo content...\n");

  // --- Step 1: Delete all non-demo users ---
  console.log("Deleting non-demo users...");
  const nonDemoUsers = await prisma.user.findMany({
    where: { email: { not: DEMO_EMAIL } },
    select: { id: true, email: true },
  });

  for (const user of nonDemoUsers) {
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`  ✗ Deleted ${user.email}`);
  }
  console.log(`  ${nonDemoUsers.length} user(s) deleted`);

  // --- Step 2: Find demo user ---
  const demoUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (!demoUser) {
    console.error("\n✗ Demo user not found — run `npm run db:seed` first");
    process.exit(1);
  }

  // --- Step 3: Delete demo user's existing content ---
  console.log("\nClearing demo user content...");

  const deletedItems = await prisma.item.deleteMany({
    where: { userId: demoUser.id },
  });
  console.log(`  ✗ Deleted ${deletedItems.count} items`);

  const deletedCollections = await prisma.collection.deleteMany({
    where: { userId: demoUser.id },
  });
  console.log(`  ✗ Deleted ${deletedCollections.count} collections`);

  // Clean up orphaned tags (tags with no items)
  const orphanedTags = await prisma.tag.deleteMany({
    where: { items: { none: {} } },
  });
  console.log(`  ✗ Deleted ${orphanedTags.count} orphaned tags`);

  // --- Step 4: Re-seed demo content via prisma db seed ---
  console.log("\nRe-seeding demo content...");
  const { execSync } = await import("child_process");
  execSync("npx prisma db seed", { stdio: "inherit" });

  console.log("\n✅ Clear and re-seed complete!");
}

main()
  .catch((e) => {
    console.error("✗ Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
