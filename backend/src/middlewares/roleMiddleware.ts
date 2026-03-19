import type { Context, Next } from "hono";
import { getPrismaClient } from "@/lib/database";

export type UserRole = "ADMIN" | "SALARY";

/**
 * ロールベース認可ミドルウェアファクトリー
 * 認証済みユーザーが必要なロールを持っているかチェック
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const decodedToken = c.get("user");

    if (!decodedToken?.uid) {
      return c.json({ error: "認証が必要です" }, 401);
    }

    // DBからユーザー情報とロールを取得
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true, role: true, email: true, name: true },
    });

    if (!user) {
      return c.json({ error: "ユーザーが見つかりません" }, 403);
    }

    // ユーザー情報とロールをContextに設定
    c.set("dbUser", user);
    c.set("userRole", user.role);

    // ロールチェック
    if (!allowedRoles.includes(user.role as UserRole)) {
      return c.json({ error: "この操作を実行する権限がありません" }, 403);
    }

    await next();
  };
};

/**
 * 管理者専用ミドルウェア
 */
export const requireAdmin = requireRole("ADMIN");
