// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is missing in environment variables');
  }

  const isProduction = process.env.NODE_ENV === 'production';

  const pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: isProduction ? 5 : 10,
    keepAlive: true,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
};

type PrismaClientConfigured = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientConfigured | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;