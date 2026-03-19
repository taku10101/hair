import type { PrismaClient } from "@prisma/client";
import type { CreateUserInput, UpdateUserInput, User } from "@/schemas/userSchema";

/**
 * Prismaを使用したユーザーリポジトリの実装
 */
export const createUserRepository = (prisma: PrismaClient) => {
  return {
    async findAll(): Promise<User[]> {
      return await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });
    },

    async findById(id: number): Promise<User | null> {
      return await prisma.user.findUnique({
        where: { id },
      });
    },

    async findByEmail(email: string): Promise<User | null> {
      return await prisma.user.findUnique({
        where: { email },
      });
    },

    async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
      return await prisma.user.findUnique({
        where: { firebaseUid },
      });
    },

    async create(data: CreateUserInput): Promise<User> {
      return await prisma.user.create({
        data,
      });
    },

    async update(id: number, data: UpdateUserInput): Promise<User> {
      return await prisma.user.update({
        where: { id },
        data,
      });
    },

    async delete(id: number): Promise<User> {
      return await prisma.user.delete({
        where: { id },
      });
    },
  };
};

export type UserRepository = ReturnType<typeof createUserRepository>;
