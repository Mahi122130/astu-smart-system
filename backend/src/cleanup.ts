import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Starting database cleanup...");
  await prisma.user.deleteMany({});
  await prisma.ticket.deleteMany({});
  console.log("✅ Database cleared! You can now register fresh.");
}

main().catch(console.error).finally(() => prisma.$disconnect());