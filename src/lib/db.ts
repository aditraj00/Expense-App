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
      }
    }
  ) as unknown as PrismaClient;
}

if (!connectionString) {
  // During build (on Vercel) the production DATABASE_URL might not be available yet.
  // Export a proxy that throws on actual DB access instead of failing the whole build.
  // This keeps the build step from crashing while still surfacing a clear error at runtime.
  // Ensure the real client is created at runtime when the environment variable is set.
  export const db = missingDbProxy();
} else {
  const adapter = new PrismaPg({ connectionString });
  export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
  }
}