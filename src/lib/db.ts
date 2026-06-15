import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function missingDbProxy(): PrismaClient {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          "DATABASE_URL is required at runtime. Set the DATABASE_URL environment variable before running the app."
        );
      },
    }
  ) as unknown as PrismaClient;
}

const db = !connectionString
  ? missingDbProxy()
  : globalForPrisma.prisma ??
    new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });

export { db };