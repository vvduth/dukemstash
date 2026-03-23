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

  // Test 3: Table counts
  const userCount = await prisma.user.count();
  const itemCount = await prisma.item.count();
  const collectionCount = await prisma.collection.count();
  console.log(`\n✓ Table counts:`);
  console.log(`  - Users: ${userCount}`);
  console.log(`  - Items: ${itemCount}`);
  console.log(`  - Collections: ${collectionCount}`);

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