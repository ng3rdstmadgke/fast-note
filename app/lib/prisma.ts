// https://www.prisma.io/docs/orm/reference/prisma-client-reference#prismaclient
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// ワーカーごとに一つの接続を使い回す
const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter: adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["warn", "error"],
})

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export default prisma