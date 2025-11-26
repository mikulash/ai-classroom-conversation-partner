import { PrismaClient } from '../generated/prisma/client';
import { NODE_ENV } from '../constants/constants';

// Create a singleton Prisma client instance
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
