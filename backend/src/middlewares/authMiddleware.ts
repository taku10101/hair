import type { Context, Next } from "hono";
import { getAuth } from "@/lib/auth/firebase";

/**
 * Authentication error class
 */
export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Authentication middleware
 * Verifies Firebase ID token and sets user info in context
 */
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("認証トークンが必要です");
    }

    const token = authHeader.substring(7);

    try {
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(token);

      c.set("user", decodedToken);

      await next();
    } catch (firebaseError: unknown) {
      // Firebase特有のエラーコードを適切に分類
      const error = firebaseError as { code?: string };
      switch (error.code) {
        case "auth/id-token-expired":
          throw new UnauthorizedError("トークンが期限切れです。再ログインしてください。");
        case "auth/id-token-revoked":
          throw new UnauthorizedError("トークンが無効化されました。");
        case "auth/argument-error":
          throw new UnauthorizedError("認証情報が不正です。");
        default:
          throw new UnauthorizedError("認証に失敗しました");
      }
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return c.json({ error: error.message }, 401);
    }

    return c.json({ error: "Invalid token" }, 401);
  }
};

/**
 * Optional authentication middleware
 * Sets user info if token is provided, but allows unauthenticated requests
 */
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(token);
      c.set("user", decodedToken);
    }

    await next();
  } catch {
    await next();
  }
};
