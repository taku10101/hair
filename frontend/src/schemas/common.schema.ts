import { z } from "zod";

/**
 * 共通のバリデーションスキーマとヘルパー
 */

/**
 * 必須文字列（空白のみは不可）
 */
export const requiredString = (message = "入力してください") => z.string().min(1, message).trim();

/**
 * メールアドレス
 */
export const email = (message = "メールアドレスの形式が正しくありません") =>
  z.string().email(message);

/**
 * URL
 */
export const url = (message = "URLの形式が正しくありません") => z.string().url(message);

/**
 * 正の整数
 */
export const positiveInt = (message = "正の整数を入力してください") =>
  z.number().int().positive(message);

/**
 * 日付（Date型）
 */
export const dateField = z.date();

/**
 * ISO8601形式の日付文字列
 */
export const isoDateString = z.string().datetime();

/**
 * ページネーション用のクエリパラメータ
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * ページネーションレスポンス
 */
export const paginationResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

export type PaginationResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * API共通エラーレスポンス
 */
export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
