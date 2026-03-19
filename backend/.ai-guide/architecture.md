# バックエンドアーキテクチャ

## 概要

このバックエンドは、単調で理解しやすい三層構造を採用しています。TypeScript + Honoで構築されたRESTful APIサーバーで、関数ベースの実装パターンを採用しています。

## ディレクトリ構造

```
backend/src/
├── index.ts             # エントリーポイント
├── routes/              # OpenAPIルート定義（@hono/zod-openapi）
├── controllers/         # リクエスト/レスポンス処理
├── services/            # ビジネスロジック層
├── repositories/        # データアクセス層
├── schemas/             # Zodスキーマと型定義
└── lib/                 # 共通ユーティリティ
    ├── errors.ts        # エラークラス定義
    ├── env.ts           # 環境変数管理
    ├── database.ts      # DB接続
    └── storage.ts       # 外部ストレージ接続
```

## レイヤー構成

### 1. Routes層（ルート定義層）

**責務**: OpenAPIルート定義とコントローラーの紐付け

```typescript
// src/routes/user.routes.ts
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { CreateUserSchema, UserResponseSchema } from '@/schemas/user.schema';
import type { UserController } from '@/controllers/user.controller';

// OpenAPIルート定義
const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: UserResponseSchema,
        },
      },
      description: 'User created successfully',
    },
  },
});

const getUserRoute = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: {
    params: z.object({
      id: z.string().transform(Number),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserResponseSchema,
        },
      },
      description: 'User retrieved successfully',
    },
  },
});

// ルートの組み立て
export const createUserRoutes = (controller: UserController) => {
  const app = new OpenAPIHono();

  app.openapi(createUserRoute, controller.createUser);
  app.openapi(getUserRoute, controller.getUser);

  return app;
};
```

**特徴:**
- OpenAPI仕様の定義（`createRoute`）
- Zodスキーマとの統合
- コントローラーメソッドとの紐付け
- ルートごとのリクエスト/レスポンス型定義

### 2. Controllers層（コントローラー層）

**責務**: HTTPリクエスト/レスポンスの処理

```typescript
// src/controllers/user.controller.ts
import type { Context } from 'hono';
import type { UserService } from '@/services/UserService';

export const createUserController = (userService: UserService) => {
  return {
    async createUser(c: Context) {
      const body = await c.req.json();
      const user = await userService.createUser(body);
      return c.json(user, 201);
    },

    async getUser(c: Context) {
      const id = Number(c.req.param('id'));
      const user = await userService.getUserById(id);
      return c.json(user);
    },

    async updateUser(c: Context) {
      const id = Number(c.req.param('id'));
      const body = await c.req.json();
      const user = await userService.updateUser(id, body);
      return c.json(user);
    },

    async deleteUser(c: Context) {
      const id = Number(c.req.param('id'));
      await userService.deleteUser(id);
      return c.json({ message: 'User deleted' });
    },
  };
};

export type UserController = ReturnType<typeof createUserController>;
```

**特徴:**
- リクエストのパース
- サービス層の呼び出し
- レスポンスの返却
- HTTPステータスコードの設定

### 3. Services層（ビジネスロジック層）

**責務**: アプリケーションのビジネスルールと複雑な処理

```typescript
// src/services/UserService.ts
export const createUserService = (
  userRepository: UserRepository
) => {
  const validateEmail = (email: string) => {
    // バリデーションロジック
  };

  return {
    async createUser(data: CreateUserInput) {
      validateEmail(data.email);
      return await userRepository.create(data);
    },

    async getUserById(id: number) {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return user;
    },
  };
};

export type UserService = ReturnType<typeof createUserService>;
```

**特徴:**
- ビジネスルールの実装
- バリデーション
- トランザクション管理
- 複数のリポジトリの組み合わせ
- クロージャでプライベート関数をカプセル化

### 4. Repositories層（データアクセス層）

**責務**: データベースや外部ストレージへのアクセス

```typescript
// src/repositories/UserRepository.ts
export const createUserRepository = (prisma: PrismaClient) => {
  return {
    async create(data: CreateUserData) {
      return await prisma.user.create({ data });
    },

    async findById(id: number) {
      return await prisma.user.findUnique({ where: { id } });
    },

    async findByEmail(email: string) {
      return await prisma.user.findUnique({ where: { email } });
    },

    async update(id: number, data: UpdateUserData) {
      return await prisma.user.update({ where: { id }, data });
    },

    async delete(id: number) {
      return await prisma.user.delete({ where: { id } });
    },
  };
};

export type UserRepository = ReturnType<typeof createUserRepository>;
```

**特徴:**
- CRUD操作の実装
- クエリの最適化
- データベース固有のロジック
- 外部サービス（S3、MinIOなど）との連携

### 5. Schemas層（スキーマ層）

**責務**: データ構造の定義とバリデーション

```typescript
// src/schemas/user.schema.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
```

**特徴:**
- Zodによるランタイムバリデーション
- TypeScript型の自動生成
- APIリクエスト/レスポンスの型安全性
- OpenAPI仕様との統合

### 6. Lib層（ユーティリティ層）

**責務**: 共通機能とインフラストラクチャの初期化

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

// src/lib/database.ts
export const getPrismaClient = () => {
  return new PrismaClient();
};

// src/lib/env.ts
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  PORT: process.env.PORT || 3000,
};
```

**特徴:**
- エラークラス
- 環境変数管理
- データベース接続
- ロガー
- その他の共通ユーティリティ

## 依存関係の方向

```
Routes → Controllers → Services → Repositories
   ↓          ↓           ↓
Schemas      Lib         Lib
```

- Routes層はControllers層に依存（コントローラーメソッドを紐付け）
- Controllers層はServices層に依存
- Services層はRepositories層に依存
- すべての層がSchemas層とLib層に依存可能
- 逆方向の依存は禁止（下位層が上位層を参照しない）

## データフロー

```
HTTP Request
    ↓
Routes層（OpenAPIルート定義）
    ↓
Controllers層（リクエスト/レスポンス処理）
    ↓
Services層（ビジネスロジック）
    ↓
Repositories層（データアクセス）
    ↓
Database/Storage
    ↓
HTTP Response
```

## 設計原則

### 1. 単一責任の原則 (SRP)

各層は明確に分離された責務を持つ:
- **Routes**: OpenAPIルート定義のみ
- **Controllers**: HTTPリクエスト/レスポンス処理のみ
- **Services**: ビジネスルール実装のみ
- **Repositories**: データアクセスのみ

### 2. 関数ベースアーキテクチャ

クラスではなく、ファクトリー関数とクロージャを活用:

```typescript
// ✅ Good: ファクトリー関数
export const createService = (deps) => {
  const privateHelper = () => { /* ... */ };

  return {
    publicMethod() { /* ... */ }
  };
};

// ❌ Bad: クラスベース
export class Service {
  constructor(deps) { /* ... */ }
  public publicMethod() { /* ... */ }
}
```

### 3. 依存性注入

すべての依存は関数パラメータで明示的に注入:

```typescript
// ✅ Good: 依存を明示的に注入
export const createService = (
  repository: UserRepository,
  logger: Logger
) => { /* ... */ };

// ❌ Bad: グローバル依存
export const createService = () => {
  const repo = getGlobalRepository(); // テスト困難
};
```

### 4. 型安全性の最大化

- `ReturnType`で型を自動推論
- Zodでランタイムバリデーション
- 明示的な型定義

## エントリーポイント（Composition Root）

アプリケーションのエントリーポイントで依存関係を組み立て:

```typescript
// src/index.ts
const app = new Hono();

// Lib層の初期化
const prisma = getPrismaClient();
const minioClient = getMinioClient();

// Repositories層の作成
const userRepository = createUserRepository(prisma);
const storageRepository = createStorageRepository(prisma, minioClient);

// Services層の作成
const userService = createUserService(userRepository);
const storageService = createStorageService(storageRepository);

// Controllers層の作成
const userController = createUserController(userService);
const storageController = createStorageController(storageService);

// Routes層の登録
app.route('/api/users', createUserRoutes(userController));
app.route('/api/storage', createStorageRoutes(storageController));

export default app;
```

## エラーハンドリング

### グローバルエラーハンドラー

```typescript
// src/lib/errorHandler.ts
export const errorHandler = (err: Error, c: Context) => {
  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.statusCode);
  }

  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
};

// src/index.ts
app.onError(errorHandler);
```

### カスタムエラークラス

```typescript
// src/lib/errors.ts
export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}
```

## テスト戦略

### ユニットテスト

各層を独立してテスト:

```typescript
// tests/services/UserService.test.ts
describe('UserService', () => {
  it('should create user', async () => {
    // モックリポジトリ
    const mockRepository = {
      create: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn(),
    };

    const service = createUserService(mockRepository);
    const result = await service.createUser(testData);

    expect(mockRepository.create).toHaveBeenCalledWith(testData);
    expect(result).toEqual(mockUser);
  });
});
```

### 統合テスト

複数の層を組み合わせてテスト:

```typescript
// tests/integration/user.test.ts
describe('User API', () => {
  it('POST /api/users should create user', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(testData),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty('id');
  });
});
```

## セキュリティ

### 環境変数管理

```typescript
// src/lib/env.ts
import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  MINIO_ENDPOINT: z.string(),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  JWT_SECRET: z.string().min(32),
});

export const env = EnvSchema.parse(process.env);
```

### バリデーション

- すべての入力をZodスキーマで検証
- SQLインジェクション対策（Prismaによる自動防御）
- XSS対策（適切なContent-Typeヘッダー）

### 認証・認可

```typescript
// src/lib/auth.ts
export const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError();
  }

  const user = await verifyToken(token);
  c.set('user', user);

  await next();
};
```

## パフォーマンス最適化

### データベースクエリ

- N+1問題の回避（`include`、`select`の活用）
- インデックスの適切な設定
- ページネーション実装

### キャッシング

```typescript
// src/services/UserService.ts
export const createUserService = (
  userRepository: UserRepository,
  cache: Cache
) => {
  return {
    async getUserById(id: number) {
      const cached = await cache.get(`user:${id}`);
      if (cached) return cached;

      const user = await userRepository.findById(id);
      await cache.set(`user:${id}`, user, 3600);
      return user;
    },
  };
};
```

## ベストプラクティス

### 1. ファクトリー関数の命名

```typescript
// ✅ Good: create{Name} パターン
export const createUserService = (repo) => { /* ... */ };
export const createStorageRepository = (prisma) => { /* ... */ };

// ❌ Bad
export const userService = (repo) => { /* ... */ };
export const UserService = (repo) => { /* ... */ };
```

### 2. 型定義のエクスポート

```typescript
// ✅ Good: ReturnTypeで自動推論
export type UserService = ReturnType<typeof createUserService>;

// ❌ Bad: 手動定義（メンテナンスコスト増）
export type UserService = {
  createUser: (data: any) => Promise<User>;
};
```

### 3. エラーハンドリング

```typescript
// ✅ Good: 明示的なエラー
throw new NotFoundError('User not found');

// ❌ Bad: 汎用エラー
throw new Error('User not found');
```

### 4. 非同期処理

```typescript
// ✅ Good: async/await
const user = await userRepository.findById(id);

// ❌ Bad: Promise chain
userRepository.findById(id).then(user => { /* ... */ });
```

## 技術スタック

- **フレームワーク**: Hono
- **言語**: TypeScript
- **ORM**: Prisma
- **バリデーション**: Zod
- **データベース**: PostgreSQL
- **オブジェクトストレージ**: MinIO/S3
- **ランタイム**: Node.js

## まとめ

このアーキテクチャは以下を重視しています:

- **シンプルさ**: 複雑な抽象化を避け、フラットな構造
- **明確性**: 各層の責務が明確で理解しやすい
- **テスタビリティ**: 依存性注入により容易なユニットテスト
- **型安全性**: TypeScriptとZodによる堅牢な型システム

新しい機能を追加する際は:

1. `schemas/`でデータ構造を定義
2. `repositories/`でデータアクセスを実装
3. `services/`でビジネスロジックを実装
4. `controllers/`でリクエスト/レスポンス処理を実装
5. `routes/`でOpenAPIルート定義を作成
6. `index.ts`で依存関係を組み立て

この順序で実装することで、保守性が高く、テストしやすいコードベースを維持できます。
