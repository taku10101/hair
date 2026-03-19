# API設計指針

## RESTful API設計原則

### HTTPメソッドの使用

| メソッド | 用途 | 冪等性 | 安全性 |
|---------|------|--------|--------|
| GET | リソースの取得 | ✓ | ✓ |
| POST | リソースの作成 | ✗ | ✗ |
| PUT | リソースの完全更新 | ✓ | ✗ |
| PATCH | リソースの部分更新 | ✗ | ✗ |
| DELETE | リソースの削除 | ✓ | ✗ |

### エンドポイント設計

#### リソースベースのURL設計
```
# Good: リソース指向
GET    /api/users           # ユーザー一覧取得
GET    /api/users/:id       # 特定ユーザー取得
POST   /api/users           # ユーザー作成
PUT    /api/users/:id       # ユーザー更新
DELETE /api/users/:id       # ユーザー削除

# Bad: 動詞ベース
GET    /api/getUsers
POST   /api/createUser
```

#### ネストされたリソース
```
# Good: 2階層まで
GET /api/users/:userId/posts           # ユーザーの投稿一覧
GET /api/users/:userId/posts/:postId   # 特定の投稿

# Bad: 過度なネスト
GET /api/users/:userId/posts/:postId/comments/:commentId/likes
```

#### クエリパラメータの使用
```
# Good: フィルタリング、ソート、ページネーション
GET /api/users?status=active&sort=createdAt&page=2&limit=20

# Good: 検索
GET /api/users?search=john
```

## レスポンス設計

### 成功レスポンス

#### 単一リソース
```typescript
// GET /api/users/:id
{
  "id": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### コレクション
```typescript
// GET /api/users
{
  "data": [
    {
      "id": "123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### 作成成功
```typescript
// POST /api/users
// Status: 201 Created
// Location: /api/users/123
{
  "id": "123",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### エラーレスポンス

#### 標準エラー形式
```typescript
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with id 123 not found",
    "details": []
  }
}
```

#### バリデーションエラー
```typescript
// Status: 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

## HTTPステータスコード

### 成功レスポンス
- **200 OK**: リクエスト成功（GET, PUT, PATCH）
- **201 Created**: リソース作成成功（POST）
- **204 No Content**: 成功だがレスポンスボディなし（DELETE）

### クライアントエラー
- **400 Bad Request**: リクエストが不正
- **401 Unauthorized**: 認証が必要
- **403 Forbidden**: 権限がない
- **404 Not Found**: リソースが存在しない
- **409 Conflict**: リソースの競合
- **422 Unprocessable Entity**: バリデーションエラー

### サーバーエラー
- **500 Internal Server Error**: サーバー内部エラー
- **503 Service Unavailable**: サービス利用不可

## バージョニング

### URLバージョニング（推奨）
```
GET /api/v1/users
GET /api/v2/users
```

### ヘッダーバージョニング
```
GET /api/users
Accept: application/vnd.api.v1+json
```

## ページネーション

### オフセットベース
```
GET /api/users?page=2&limit=20
```

```typescript
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### カーソルベース
```
GET /api/users?cursor=eyJpZCI6IjEyMyJ9&limit=20
```

```typescript
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6IjE0MyJ9",
    "hasNext": true
  }
}
```

## フィルタリング・ソート

### フィルタリング
```
# 単一条件
GET /api/users?status=active

# 複数条件
GET /api/users?status=active&role=admin

# 範囲指定
GET /api/users?createdAfter=2024-01-01&createdBefore=2024-12-31
```

### ソート
```
# 昇順
GET /api/users?sort=createdAt

# 降順
GET /api/users?sort=-createdAt

# 複数フィールド
GET /api/users?sort=-createdAt,name
```

## 認証・認可

### Bearer Token認証
```typescript
// リクエストヘッダー
Authorization: Bearer <access_token>

// ミドルウェア実装
export const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const payload = await verifyToken(token);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};
```

## CORS設定

```typescript
import { cors } from 'hono/cors';

app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);
```

## レート制限

```typescript
// リクエスト数制限の実装例
import { rateLimiter } from '@/middleware/rate-limiter';

app.use('/api/*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 最大100リクエスト
}));
```

## APIドキュメント

### OpenAPI/Swagger
- OpenAPI仕様に従ったドキュメント作成
- Swagger UIでインタラクティブなドキュメント提供

```typescript
// Honoでのスキーマ定義例
import { createRoute, z } from '@hono/zod-openapi';

const route = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '123' }),
    }),
  },
  responses: {
    200: {
      description: 'User found',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    404: {
      description: 'User not found',
    },
  },
});
```

## セキュリティベストプラクティス

### 入力バリデーション
```typescript
// Good: 必ずバリデーション
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### SQLインジェクション対策
- Prismaを使用することで自動的に対策される
- 生のSQLクエリは避ける

### XSS対策
- レスポンスのエスケープ処理
- Content-Security-Policyヘッダーの設定

### CSRF対策
- トークンベースの保護
- SameSite Cookie属性の使用

## パフォーマンス最適化

### キャッシング
```typescript
// Cache-Controlヘッダーの設定
app.get('/api/users/:id', async (c) => {
  const user = await userService.findById(c.req.param('id'));

  c.header('Cache-Control', 'public, max-age=300'); // 5分キャッシュ
  return c.json(user);
});
```

### 圧縮
```typescript
import { compress } from 'hono/compress';

app.use(compress());
```

### ETag
```typescript
app.get('/api/users/:id', async (c) => {
  const user = await userService.findById(c.req.param('id'));
  const etag = generateETag(user);

  if (c.req.header('If-None-Match') === etag) {
    return c.body(null, 304); // Not Modified
  }

  c.header('ETag', etag);
  return c.json(user);
});
```
