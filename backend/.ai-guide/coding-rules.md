# バックエンドコーディング規約

## 基本方針

共通規約については[ルートのコーディング規約](../../.ai-guide/coding-rules.md)を参照してください。
このドキュメントでは、バックエンド固有の規約のみを記載します。

## ファイル・ディレクトリ命名規則

### ファイル命名の原則
- **すべてのファイル名はロワーキャメルケース（lowerCamelCase）で統一する**
- 例外: 定数ファイルや特殊な用途のファイル（CLAUDE.md、README.mdなど）のみ大文字を許可

### ファイル命名
- **リポジトリ**: `{entity}Repository.ts`（例: `userRepository.ts`, `storageRepository.ts`）
- **サービス**: `{entity}Service.ts`（例: `userService.ts`, `storageService.ts`）
- **コントローラー**: `{entity}Controller.ts`（例: `userController.ts`, `storageController.ts`）
- **ルート**: `{entity}Routes.ts`（例: `userRoutes.ts`, `storageRoutes.ts`）
- **スキーマ**: `{entity}Schema.ts`（例: `userSchema.ts`, `storageSchema.ts`）
- **Libファイル**: `{purpose}.ts`（例: `errors.ts`, `env.ts`, `database.ts`）

### ディレクトリ
- 小文字（例: `routes/`, `controllers/`, `services/`, `repositories/`, `schemas/`, `lib/`）

## レイヤー別実装規約

### Routes層（ルート定義層）

OpenAPIルート定義とコントローラーの紐付けを担当します。

```typescript
// Good: OpenAPIルート定義
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { CreateUserSchema, UserResponseSchema } from '@/schemas/userSchema';
import type { UserController } from '@/controllers/userController';

// OpenAPIルート定義
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

// ルートの組み立て
export const createUserRoutes = (controller: UserController) => {
  const app = new OpenAPIHono();

  app.openapi(getUserRoute, controller.getUser);
  app.openapi(createUserRoute, controller.createUser);

  return app;
};

// Bad: ルート内にロジックを書く
export const createUserRoutes = (service: UserService) => {
  const app = new Hono();

  app.get('/:id', async (c) => {
    // ロジックをルート内に書かない
    const id = Number(c.req.param('id'));
    const user = await service.getUserById(id);
    return c.json(user);
  });
};
```

**ポイント:**
- `createRoute`でOpenAPI仕様を定義
- Zodスキーマとの統合
- コントローラーメソッドとの紐付け
- リクエスト/レスポンスの型定義

### Controllers層（コントローラー層）

HTTPリクエスト/レスポンスの処理を担当します。

```typescript
// Good: ファクトリー関数でサービスを注入
import type { Context } from 'hono';
import type { UserService } from '@/services/userService';
import { NotFoundError } from '@/lib/errors';

export const createUserController = (userService: UserService) => {
  return {
    async getUser(c: Context) {
      const id = Number(c.req.param('id'));
      const user = await userService.getUserById(id);
      return c.json(user);
    },

    async createUser(c: Context) {
      const body = await c.req.json();
      const user = await userService.createUser(body);
      return c.json(user, 201);
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

// Bad: クラスベースやロジックの混在
export class UserController {
  constructor(private userService: UserService) {}

  async getUser(c: Context) {
    // ビジネスロジックをコントローラーに書かない
    const id = Number(c.req.param('id'));
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundError(); // エラーハンドリングはサービス層で
    }
    return c.json(user);
  }
}
```

**ポイント:**
- ファクトリー関数パターン（`create{Name}Controller`）
- サービス層を依存として受け取る
- リクエストのパース
- レスポンスの返却
- ビジネスロジックは書かない（サービス層に委譲）

### Services層（ビジネスロジック層）

アプリケーションのビジネスルールと複雑な処理を実装します。

```typescript
// Good: ファクトリー関数でリポジトリを注入
import type { UserRepository } from '@/repositories/userRepository';
import { NotFoundError, ValidationError } from '@/lib/errors';
import type { CreateUserInput } from '@/schemas/userSchema';

export const createUserService = (userRepository: UserRepository) => {
  // プライベートヘルパー関数（クロージャでカプセル化）
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  };

  // 公開API
  return {
    async createUser(data: CreateUserInput) {
      validateEmail(data.email);

      // 重複チェック
      const existing = await userRepository.findByEmail(data.email);
      if (existing) {
        throw new ValidationError('Email already exists');
      }

      return await userRepository.create(data);
    },

    async getUserById(id: number) {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return user;
    },

    async updateUser(id: number, data: Partial<CreateUserInput>) {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (data.email) {
        validateEmail(data.email);
      }

      return await userRepository.update(id, data);
    },
  };
};

// 型推論を活用
export type UserService = ReturnType<typeof createUserService>;

// Bad: クラスベース
export class UserService {
  constructor(private userRepository: UserRepository) {}
  async createUser(data: CreateUserInput) { /* ... */ }
}
```

**ポイント:**
- ファクトリー関数パターン（`create{Name}Service`）
- クロージャでプライベート関数をカプセル化
- `ReturnType`で型を自動推論
- 明示的なエラーをthrow

### Repositories層（データアクセス層）

データベースや外部ストレージへのアクセスを担当します。

```typescript
// Good: ファクトリー関数でPrismaクライアントを注入
import type { PrismaClient } from '@prisma/client';

export const createUserRepository = (prisma: PrismaClient) => {
  return {
    async create(data: CreateUserData) {
      return await prisma.user.create({ data });
    },

    async findById(id: number) {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    },

    async findByEmail(email: string) {
      return await prisma.user.findUnique({ where: { email } });
    },

    async update(id: number, data: UpdateUserData) {
      return await prisma.user.update({
        where: { id },
        data,
      });
    },

    async delete(id: number) {
      return await prisma.user.delete({ where: { id } });
    },

    async list(page = 1, limit = 20) {
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count(),
      ]);
      return { users, total };
    },
  };
};

export type UserRepository = ReturnType<typeof createUserRepository>;

// Bad: クラスベース、インターフェース定義の乱用
export interface IUserRepository { /* ... */ }
export class PrismaUserRepository implements IUserRepository { /* ... */ }
```

**ポイント:**
- ファクトリー関数パターン（`create{Name}Repository`）
- CRUD操作を提供
- Prismaの`select`でN+1問題を回避
- ページネーション実装
- インターフェースは不要（型推論を活用）

### Schemas層（スキーマ層）

データ構造の定義とバリデーションを担当します。

```typescript
// Good: Zodスキーマで型とバリデーションを定義
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const UpdateUserSchema = CreateUserSchema.partial();

export const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 型推論
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;

// Bad: 手動で型定義（重複、メンテナンスコスト増）
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}
```

**ポイント:**
- Zodスキーマでランタイムバリデーション
- `z.infer`で型を自動推論
- リクエスト/レスポンスごとにスキーマ定義
- `.partial()`や`.pick()`で再利用

### Lib層（ユーティリティ層）

共通機能とインフラストラクチャの初期化を担当します。

```typescript
// Good: errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

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

// Good: database.ts
import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

export const getPrismaClient = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
};

// Good: env.ts
import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MINIO_ENDPOINT: z.string(),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_BUCKET_NAME: z.string(),
});

export const env = EnvSchema.parse(process.env);
```

**ポイント:**
- カスタムエラークラスの定義
- シングルトンパターンでDB接続管理
- Zodで環境変数のバリデーション

## 依存性注入（DI）

### Composition Root（エントリーポイント）

```typescript
// Good: index.ts
import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database';
import { getMinioClient } from '@/lib/storage';
import { createUserRepository } from '@/repositories/userRepository';
import { createStorageRepository } from '@/repositories/storageRepository';
import { createUserService } from '@/services/userService';
import { createStorageService } from '@/services/storageService';
import { createUserController } from '@/controllers/userController';
import { createStorageController } from '@/controllers/storageController';
import { createUserRoutes } from '@/routes/userRoutes';
import { createStorageRoutes } from '@/routes/storageRoutes';
import { errorHandler } from '@/lib/errorHandler';

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

// エラーハンドラー
app.onError(errorHandler);

export default app;
```

**ポイント:**
- 依存関係を明示的に組み立て
- トップレベルで一度だけ初期化
- DIコンテナは不要（手動注入で十分）

## エラーハンドリング

### グローバルエラーハンドラー

```typescript
// Good: lib/errorHandler.ts
import type { Context } from 'hono';
import { AppError } from './errors';

export const errorHandler = (err: Error, c: Context) => {
  console.error(err);

  if (err instanceof AppError) {
    return c.json(
      { error: err.message },
      err.statusCode as any
    );
  }

  return c.json(
    { error: 'Internal Server Error' },
    500
  );
};
```

### エラーの使い方

```typescript
// Good: 明示的なエラー
import { NotFoundError, ValidationError } from '@/lib/errors';

if (!user) {
  throw new NotFoundError('User not found');
}

if (!data.email) {
  throw new ValidationError('Email is required');
}

// Bad: 汎用エラー
throw new Error('User not found'); // ステータスコードが不明
```

## 非同期処理

### async/await使用

```typescript
// Good: async/await
export const getUser = async (id: number) => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

// Bad: Promiseチェーン
export const getUser = (id: number) => {
  return userRepository.findById(id).then((user) => {
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  });
};
```

### 並列処理

```typescript
// Good: Promise.all で並列実行
const [user, posts] = await Promise.all([
  userRepository.findById(userId),
  postRepository.findByUserId(userId),
]);

// Bad: 直列実行（遅い）
const user = await userRepository.findById(userId);
const posts = await postRepository.findByUserId(userId);
```

## バリデーション

### リクエストバリデーション

```typescript
// Good: OpenAPIルートでバリデーション自動化
import { createRoute } from '@hono/zod-openapi';
import { CreateUserSchema } from '@/schemas/userSchema';

const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema, // 自動的にバリデーション
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
      description: 'User created',
    },
  },
});

// コントローラーではバリデーション済みのデータが渡される
export const createUserController = (userService: UserService) => {
  return {
    async createUser(c: Context) {
      const body = await c.req.json(); // すでにバリデーション済み
      const user = await userService.createUser(body);
      return c.json(user, 201);
    },
  };
};
```

## テスト

### ユニットテスト

```typescript
// Good: モック注入で依存を切り離す
import { describe, it, expect, vi } from 'vitest';
import { createUserService } from '@/services/userService';

describe('UserService', () => {
  it('should create user', async () => {
    // モックリポジトリ
    const mockRepository = {
      create: vi.fn().mockResolvedValue({ id: 1, name: 'Test', email: 'test@example.com' }),
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };

    const userService = createUserService(mockRepository);

    const result = await userService.createUser({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toHaveProperty('id');
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should throw error when email exists', async () => {
    const mockRepository = {
      create: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    };

    const userService = createUserService(mockRepository);

    await expect(
      userService.createUser({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('Email already exists');
  });
});
```

### 統合テスト

```typescript
// Good: 実際のHTTPリクエストをテスト
import { describe, it, expect } from 'vitest';
import app from '@/index';

describe('User API', () => {
  it('POST /api/users should create user', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty('id');
    expect(json.email).toBe('test@example.com');
  });
});
```

## パフォーマンス最適化

### N+1問題の回避

```typescript
// Good: includeやselectで一度に取得
const users = await prisma.user.findMany({
  include: {
    posts: true, // 一度のクエリで関連データも取得
  },
});

// Bad: ループ内でクエリ（N+1問題）
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { userId: user.id } });
}
```

### ページネーション

```typescript
// Good: skipとtakeでページネーション
const page = 1;
const limit = 20;

const [users, total] = await Promise.all([
  prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
  }),
  prisma.user.count(),
]);

const totalPages = Math.ceil(total / limit);
```

## ベストプラクティスまとめ

### ✅ Good

- ファクトリー関数パターン（`create{Name}`）
- `ReturnType`で型推論
- クロージャでプライベート関数カプセル化
- 明示的な依存性注入
- Zodでバリデーション
- カスタムエラークラス
- async/await使用
- Promise.allで並列処理

### ❌ Bad

- クラスベース
- グローバル依存
- 手動型定義
- 汎用エラー（`Error`）
- Promiseチェーン
- N+1問題
- ページネーションなし
