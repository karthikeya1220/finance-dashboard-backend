import { PrismaClient } from "@prisma/client";
import { env } from "./env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Prisma client instance with optional logging
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Connect to the database
 * @throws Error if connection fails
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    throw error;
  }
}

/**
 * Disconnect from the database
 * @throws Error if disconnection fails
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("✅ Disconnected from database");
  } catch (error) {
    console.error("❌ Failed to disconnect from database:", error);
    throw error;
  }
}
