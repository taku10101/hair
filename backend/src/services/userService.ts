import { ConflictError, NotFoundError } from "@/lib/errors";
import type { UserRepository } from "@/repositories/userRepository";
import type { CreateUserInput, UpdateUserInput, User } from "@/schemas/userSchema";

/**
 * ユーザーサービスの作成
 * @param userRepository ユーザーリポジトリ
 */
export const createUserService = (userRepository: UserRepository) => {
  return {
    async getAllUsers(): Promise<User[]> {
      return await userRepository.findAll();
    },

    async getUserById(id: number): Promise<User | null> {
      return await userRepository.findById(id);
    },

    async createUser(input: CreateUserInput): Promise<User> {
      const existingUser = await userRepository.findByEmail(input.email);
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }
      return await userRepository.create(input);
    },

    async updateUser(id: number, input: UpdateUserInput): Promise<User> {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      if (input.email) {
        const existingUser = await userRepository.findByEmail(input.email);
        if (existingUser && existingUser.id !== id) {
          throw new ConflictError("Email is already in use by another user");
        }
      }

      return await userRepository.update(id, input);
    },

    async deleteUser(id: number): Promise<User> {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return await userRepository.delete(id);
    },
  };
};

/**
 * ユーザーサービスの型定義
 */
export type UserService = ReturnType<typeof createUserService>;
