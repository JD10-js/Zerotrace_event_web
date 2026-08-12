import { PrismaClient } from '@prisma/client';

// Fallback to dummy postgresql connection string if DATABASE_URL is not set in environment
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/eureka_db';

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
