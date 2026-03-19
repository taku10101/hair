import { z } from "zod";

/**
 * 環境変数のスキーマ定義
 */
const envSchema = z.object({
  /**
   * データベース接続URL
   */
  DATABASE_URL: z.string().url({
    message: "DATABASE_URL must be a valid URL",
  }),

  /**
   * サーバーポート番号
   */
  PORT: z
    .string()
    .default("3000")
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive().int()),

  /**
   * 実行環境
   */
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  /**
   * MinIOエンドポイント
   */
  MINIO_ENDPOINT: z.string().default("localhost"),

  /**
   * MinIOポート番号
   */
  MINIO_PORT: z
    .string()
    .default("9000")
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive().int()),

  /**
   * MinIOアクセスキー
   */
  MINIO_ACCESS_KEY: z.string().default("minioadmin"),

  /**
   * MinIOシークレットキー
   */
  MINIO_SECRET_KEY: z.string().default("minioadmin"),

  /**
   * MinIO SSL使用フラグ
   */
  MINIO_USE_SSL: z
    .string()
    .default("false")
    .transform((val) => val === "true"),

  /**
   * MinIOバケット名
   */
  MINIO_BUCKET_NAME: z.string().default("web-template"),

  /**
   * Firebase Admin SDK - Project ID
   */
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required"),

  /**
   * Firebase Admin SDK - Private Key
   */
  FIREBASE_PRIVATE_KEY: z.string().min(1, "FIREBASE_PRIVATE_KEY is required"),

  /**
   * Firebase Admin SDK - Client Email
   */
  FIREBASE_CLIENT_EMAIL: z.string().email("FIREBASE_CLIENT_EMAIL must be a valid email"),
});

/**
 * 環境変数の型
 */
export type Env = z.infer<typeof envSchema>;

/**
 * 環境変数のパースと検証
 * アプリケーション起動時に実行される
 */
function parseEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      throw new Error(`環境変数の検証に失敗しました:\n${errorMessage}`);
    }
    throw new Error("環境変数の設定が不正です");
  }
}

/**
 * 検証済み環境変数
 * アプリケーション全体で使用可能
 */
export const env = parseEnv();
