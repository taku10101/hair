import type { Context, Next } from "hono";
import { ZodError } from "zod";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";

/**
 * エラーハンドリングミドルウェア
 * カスタムエラークラスを適切なHTTPステータスコードに変換
 */
export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    // NotFoundError: 404（見つからないエラー）
    if (error instanceof NotFoundError) {
      return c.json(
        {
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        },
        404
      );
    }

    // ConflictError: 409（競合エラー）
    if (error instanceof ConflictError) {
      return c.json(
        {
          error: {
            code: "CONFLICT",
            message: error.message,
          },
        },
        409
      );
    }

    // ValidationError: 400（バリデーションエラー）
    if (error instanceof ValidationError) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        },
        400
      );
    }

    // UnauthorizedError: 401（認証エラー）
    if (error instanceof UnauthorizedError) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: error.message,
          },
        },
        401
      );
    }

    // ForbiddenError: 403（権限エラー）
    if (error instanceof ForbiddenError) {
      return c.json(
        {
          error: {
            code: "FORBIDDEN",
            message: error.message,
          },
        },
        403
      );
    }

    // ZodError: 400（Zodバリデーションエラー）
    if (error instanceof ZodError) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        },
        400
      );
    }

    // その他のエラー: 500
    return c.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      },
      500
    );
  }
};
