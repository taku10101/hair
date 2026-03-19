/**
 * スキーマの一元管理
 *
 * このディレクトリには、以下のZodスキーマを配置します:
 * - フォームバリデーション用スキーマ
 * - APIリクエスト/レスポンス用スキーマ
 * - データ変換用スキーマ
 *
 * 使用例:
 * ```ts
 * import { loginSchema, type LoginFormData } from "@/schemas";
 * ```
 */

// 認証関連
export * from "./auth.schema";

// 共通スキーマ
export * from "./common.schema";
