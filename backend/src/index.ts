import "dotenv/config";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
// Controllers層（コントローラー層）
import { createAuthController } from "@/controllers/authController";
import { createStorageController } from "@/controllers/storageController";
import { createUserController } from "@/controllers/userController";
// Lib層（ライブラリ層）
import { getPrismaClient } from "@/lib/database";
import { env } from "@/lib/env";
import { errorHandler } from "@/lib/helpers/errorHandler";
import { getMinioClient, initializeMinIOBucket } from "@/lib/storage";
// Repositories層（リポジトリ層）
import { createStorageRepository } from "@/repositories/storageRepository";
import { createUserRepository } from "@/repositories/userRepository";
// Routes層（ルート層）
import { createAuthRoutes } from "@/routes/authRoutes";
import { createStorageRoutes } from "@/routes/storageRoutes";
import { createUserRoutes } from "@/routes/userRoutes";
// Services層（サービス層）
import { createAuthService } from "@/services/authService";
import { createStorageService } from "@/services/storageService";
import { createUserService } from "@/services/userService";

// === Composition Root（依存性注入のルート） ===

// 1. Lib層の初期化
const prisma = getPrismaClient();
const minioClient = getMinioClient();

// 2. Repositories層の作成
const userRepository = createUserRepository(prisma);
const storageRepository = createStorageRepository(prisma, minioClient);

// 3. Services層の作成
const authService = createAuthService(userRepository);
const userService = createUserService(userRepository);
const storageService = createStorageService(storageRepository);

// 4. Controllers層の作成
const authController = createAuthController(authService);
const userController = createUserController(userService);
const storageController = createStorageController(storageService);

// 5. Routes層の作成
const authRoutes = createAuthRoutes(authController);
const userRoutes = createUserRoutes(userController);
const storageRoutes = createStorageRoutes(storageController);

// 6. アプリケーション構築
const app = new OpenAPIHono();

// グローバルミドルウェア
app.use("*", cors());
app.use("*", errorHandler);

// ルート登録
app.route("/api/auth", authRoutes);
app.route("/api/users", userRoutes);
app.route("/api/storage", storageRoutes);

// OpenAPIドキュメント
app.doc("/api/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Backend API",
  },
});

// Swagger UIドキュメント
app.get("/api/ui", swaggerUI({ url: "/api/doc" }));

// ヘルスチェック
app.get("/", (c) => {
  return c.json({
    message: "Backend API is running",
    docs: "/api/ui",
    environment: env.NODE_ENV,
  });
});

// 7. サーバー起動
async function startServer() {
  try {
    await initializeMinIOBucket();
  } catch (_error) {}

  serve({
    fetch: app.fetch,
    port: env.PORT,
  });
}

startServer();

export default app;
