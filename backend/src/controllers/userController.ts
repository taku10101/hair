import type { Context } from "hono";
import { ValidationError } from "@/lib/errors";
import { CreateUserSchema, UpdateUserSchema } from "@/schemas/userSchema";
import type { UserService } from "@/services/userService";

/**
 * ユーザーコントローラーの作成
 * @param userService ユーザーサービス
 */
export const createUserController = (userService: UserService) => {
  return {
    /**
     * 全ユーザーを取得
     */
    async getAll(c: Context) {
      const users = await userService.getAllUsers();
      return c.json(users, 200);
    },

    /**
     * IDでユーザーを取得
     */
    async getById(c: Context) {
      const id = Number(c.req.param("id"));
      if (Number.isNaN(id)) {
        throw new ValidationError("Invalid user ID");
      }

      const user = await userService.getUserById(id);
      if (!user) {
        throw new ValidationError("User not found");
      }

      return c.json(user, 200);
    },

    /**
     * 新規ユーザーを作成
     */
    async create(c: Context) {
      const body = await c.req.json();
      const validatedData = CreateUserSchema.parse(body);
      const user = await userService.createUser(validatedData);
      return c.json(user, 201);
    },

    /**
     * ユーザー情報を更新
     */
    async update(c: Context) {
      const id = Number(c.req.param("id"));
      if (Number.isNaN(id)) {
        throw new ValidationError("Invalid user ID");
      }

      const body = await c.req.json();
      const validatedData = UpdateUserSchema.parse(body);
      const user = await userService.updateUser(id, validatedData);
      return c.json(user, 200);
    },

    /**
     * ユーザーを削除
     */
    async delete(c: Context) {
      const id = Number(c.req.param("id"));
      if (Number.isNaN(id)) {
        throw new ValidationError("Invalid user ID");
      }

      const user = await userService.deleteUser(id);
      return c.json(user, 200);
    },
  };
};

/**
 * ユーザーコントローラーの型定義
 */
export type UserController = ReturnType<typeof createUserController>;
