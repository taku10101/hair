import { z } from "zod";

/**
 * 認証関連のZodスキーマ
 * フォームバリデーションとAPI通信の型安全性を提供
 */

// メールアドレスのバリデーション
const emailSchema = z
  .string()
  .min(1, "メールアドレスを入力してください")
  .email("メールアドレスの形式が正しくありません");

// パスワードのバリデーション
const passwordSchema = z.string().min(1, "パスワードを入力してください");

// サインアップ用のパスワードバリデーション（より厳格）
const signupPasswordSchema = z
  .string()
  .min(1, "パスワードを入力してください")
  .min(8, "パスワードは8文字以上で入力してください");

/**
 * ログインフォームスキーマ
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * サインアップフォームスキーマ
 */
export const signupSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  email: emailSchema,
  password: signupPasswordSchema,
});

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * DB同期用のリクエストスキーマ
 */
export const authSyncRequestSchema = z.object({
  name: z.string(),
});

export type AuthSyncRequest = z.infer<typeof authSyncRequestSchema>;

/**
 * 認証レスポンススキーマ
 */
export const authUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable().optional(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
