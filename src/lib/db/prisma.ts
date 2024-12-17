import { PrismaClient, Prisma } from '@prisma/client';
import env from '../config/env';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaOptions: Prisma.PrismaClientOptions = {
  datasources: {
    db: {
      url: env.POSTGRES_PRISMA_URL
    }
  },
  log: env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] as const
    : ['error'] as const
};

export const prisma = global.prisma || new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Re-export PrismaClient and namespace
export type { PrismaClient } from '@prisma/client';
export * from '@prisma/client';
  