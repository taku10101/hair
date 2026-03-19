import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | undefined;

export const getPrismaClient = (): PrismaClient => {
  if (!prismaInstance) {
    if (globalForPrisma.prisma) {
      prismaInstance = globalForPrisma.prisma;
    } else {
      prismaInstance =
        process.env.NODE_ENV === "development"
          ? new PrismaClient({ log: ["query", "error", "warn"] })
          : new PrismaClient({ log: ["error"] });

      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaInstance;
      }
    }
  }

  return prismaInstance;
};
