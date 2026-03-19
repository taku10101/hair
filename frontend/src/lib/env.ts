import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default("http://localhost:3088"),
  VITE_FIREBASE_API_KEY: z.string().min(1, "VITE_FIREBASE_API_KEY is required"),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, "VITE_FIREBASE_AUTH_DOMAIN is required"),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1, "VITE_FIREBASE_PROJECT_ID is required"),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1, "VITE_FIREBASE_STORAGE_BUCKET is required"),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, "VITE_FIREBASE_MESSAGING_SENDER_ID is required"),
  VITE_FIREBASE_APP_ID: z.string().min(1, "VITE_FIREBASE_APP_ID is required"),
  VITE_USE_AUTH_EMULATOR: z.enum(["true", "false"]).optional(),
});

function parseEnv() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(
        (err: z.ZodIssue) => `  - ${err.path.join(".")}: ${err.message}`
      );
      throw new Error(
        `環境変数の検証に失敗しました:\n${messages.join("\n")}\n\n` +
          `.env ファイルを確認してください。`
      );
    }
    throw error;
  }
}

export const env = parseEnv();
