// https://www.prisma.io/docs/orm/reference/prisma-client-reference#prismaclient
import { PrismaClient } from "@/lib/generated/prisma/client";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["warn", "error"],
});