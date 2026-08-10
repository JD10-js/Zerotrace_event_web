import { PrismaClient } from '@prisma/client';

// Fallback to local SQLite file:./dev.db if DATABASE_URL is not set in production environment variables
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
