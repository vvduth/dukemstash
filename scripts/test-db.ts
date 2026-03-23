import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // Test 1: Connection
  const result = await prisma.$queryRawUnsafe<{ now: Date }[]>("SELECT NOW()");
  console.log("✓ Connected to database at:", result[0].now);

  // Test 2: System item types
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });
  console.log(`\n✓ Found ${itemTypes.length} system item types:`);
  for (const type of itemTypes) {
    console.log(`  - ${type.name} (${type.icon}, ${type.color})`);
  }

  // Test 3: Demo user
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
  });
  console.log(`\n✓ Demo user:`);
  console.log(`  - Name: ${user?.name}`);
  console.log(`  - Email: ${user?.email}`);
  console.log(`  - isPro: ${user?.isPro}`);
  console.log(`  - emailVerified: ${user?.emailVerified}`);
  console.log(`  - hasPassword: ${!!user?.password}`);

  if (!user) {
    console.error("\n✗ Demo user not found — run prisma db seed first");
    process.exit(1);
  }

  // Test 4: Collections with item counts
  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { name: "asc" },
  });
  console.log(`\n✓ Found ${collections.length} collections:`);
  for (const col of collections) {
    console.log(`  - ${col.name} (${col.items.length} items, fav: ${col.isFavorite})`);
  }

  // Test 5: Items with types, tags, and collections
  const items = await prisma.item.findMany({
    where: { userId: user.id },
    include: {
      itemType: true,
      tags: { include: { tag: true } },
      collections: { include: { collection: true } },
    },
    orderBy: { title: "asc" },
  });
  console.log(`\n✓ Found ${items.length} items:`);
  for (const item of items) {
    const tags = item.tags.map((t) => t.tag.name).join(", ");
    const cols = item.collections.map((c) => c.collection.name).join(", ");
    const flags = [
      item.isFavorite && "★",
      item.isPinned && "📌",
    ].filter(Boolean).join(" ");
    console.log(`  - [${item.itemType.name}] ${item.title} ${flags}`);
    console.log(`    tags: ${tags}`);
    console.log(`    collections: ${cols}`);
    if (item.url) console.log(`    url: ${item.url}`);
    if (item.language) console.log(`    language: ${item.language}`);
  }

  // Test 6: Tags
  const tags = await prisma.tag.findMany({
    include: { items: true },
    orderBy: { name: "asc" },
  });
  console.log(`\n✓ Found ${tags.length} tags:`);
  for (const tag of tags) {
    console.log(`  - ${tag.name} (${tag.items.length} items)`);
  }

  // Test 7: Summary counts
  const userCount = await prisma.user.count();
  const itemCount = await prisma.item.count();
  const collectionCount = await prisma.collection.count();
  const tagCount = await prisma.tag.count();
  const itemCollectionCount = await prisma.itemsOnCollections.count();
  const tagItemCount = await prisma.tagsOnItems.count();
  console.log(`\n✓ Summary:`);
  console.log(`  - Users: ${userCount}`);
  console.log(`  - Item Types: ${itemTypes.length}`);
  console.log(`  - Items: ${itemCount}`);
  console.log(`  - Collections: ${collectionCount}`);
  console.log(`  - Tags: ${tagCount}`);
  console.log(`  - Item↔Collection links: ${itemCollectionCount}`);
  console.log(`  - Item↔Tag links: ${tagItemCount}`);

  console.log("\n✓ All database tests passed!");
}

main()
  .catch((e) => {
    console.error("✗ Database test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });