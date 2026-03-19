# データベース設計とPrisma使用方法

## Prisma概要

Prismaは、TypeScript/JavaScriptのための次世代ORMです。

### 主要コンポーネント
- **Prisma Client**: 自動生成される型安全なクエリビルダー
- **Prisma Migrate**: マイグレーションシステム
- **Prisma Studio**: データベースGUI

## スキーマ設計

### Prismaスキーマファイル

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts Post[]

  @@map("users")
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@map("posts")
}
```

## 命名規約

### モデル名
- **PascalCase**: モデル名は単数形のPascalCase（例: `User`, `Post`）

### フィールド名
- **camelCase**: フィールド名はcamelCase（例: `createdAt`, `isActive`）

### テーブル名
- **snake_case**: `@@map`で複数形のsnake_case（例: `users`, `posts`）

```prisma
model User {
  // ...
  @@map("users")
}
```

## データ型

### 基本型

| Prisma型 | PostgreSQL型 | TypeScript型 |
|----------|--------------|--------------|
| String   | TEXT/VARCHAR | string       |
| Int      | INTEGER      | number       |
| BigInt   | BIGINT       | bigint       |
| Float    | DOUBLE       | number       |
| Decimal  | DECIMAL      | Decimal      |
| Boolean  | BOOLEAN      | boolean      |
| DateTime | TIMESTAMP    | Date         |
| Json     | JSONB        | JsonValue    |

### UUID主キー（推奨）

```prisma
model User {
  id String @id @default(uuid())
}
```

### 自動インクリメント主キー

```prisma
model User {
  id Int @id @default(autoincrement())
}
```

## リレーション設計

### One-to-Many（1対多）

```prisma
model User {
  id    String @id @default(uuid())
  posts Post[]
}

model Post {
  id       String @id @default(uuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

### Many-to-Many（多対多）

```prisma
model Post {
  id   String @id @default(uuid())
  tags Tag[]
}

model Tag {
  id    String @id @default(uuid())
  posts Post[]
}
```

### One-to-One（1対1）

```prisma
model User {
  id      String   @id @default(uuid())
  profile Profile?
}

model Profile {
  id     String @id @default(uuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

## インデックス

### 単一カラムインデックス

```prisma
model User {
  email String @unique
  // または
  email String

  @@index([email])
}
```

### 複合インデックス

```prisma
model Post {
  authorId  String
  createdAt DateTime

  @@index([authorId, createdAt])
}
```

### ユニーク制約

```prisma
model User {
  email    String
  username String

  @@unique([email, username])
}
```

## マイグレーション

### 開発環境

```bash
# マイグレーションファイルの作成と実行
pnpm prisma migrate dev --name add_user_table

# データベースのリセット
pnpm prisma migrate reset
```

### 本番環境

```bash
# マイグレーションの実行
pnpm prisma migrate deploy
```

### スキーマ同期（開発のみ）

```bash
# マイグレーション履歴なしでDBを同期
pnpm prisma db push
```

## Prisma Client使用方法

### クライアント初期化

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### CRUD操作

#### Create
```typescript
// 単一作成
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});

// リレーションと同時作成
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    posts: {
      create: [
        { title: 'Post 1', content: 'Content 1' },
      ],
    },
  },
  include: {
    posts: true,
  },
});
```

#### Read
```typescript
// 全件取得
const users = await prisma.user.findMany();

// 条件付き取得
const users = await prisma.user.findMany({
  where: {
    isActive: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
  skip: 0,
});

// 単一取得
const user = await prisma.user.findUnique({
  where: { id: '123' },
});

// リレーション含む取得
const user = await prisma.user.findUnique({
  where: { id: '123' },
  include: {
    posts: true,
  },
});
```

#### Update
```typescript
// 単一更新
const user = await prisma.user.update({
  where: { id: '123' },
  data: {
    name: 'Jane Doe',
  },
});

// 複数更新
const result = await prisma.user.updateMany({
  where: { isActive: false },
  data: { isActive: true },
});
```

#### Delete
```typescript
// 単一削除
const user = await prisma.user.delete({
  where: { id: '123' },
});

// 複数削除
const result = await prisma.user.deleteMany({
  where: { isActive: false },
});
```

### フィルタリング

```typescript
// AND条件
const users = await prisma.user.findMany({
  where: {
    AND: [
      { isActive: true },
      { email: { contains: '@example.com' } },
    ],
  },
});

// OR条件
const users = await prisma.user.findMany({
  where: {
    OR: [
      { name: { contains: 'John' } },
      { email: { contains: 'john' } },
    ],
  },
});

// NOT条件
const users = await prisma.user.findMany({
  where: {
    NOT: {
      email: { endsWith: '@spam.com' },
    },
  },
});
```

### ソート・ページネーション

```typescript
const users = await prisma.user.findMany({
  orderBy: [
    { createdAt: 'desc' },
    { name: 'asc' },
  ],
  take: 20,  // limit
  skip: 40,  // offset
});
```

### トランザクション

```typescript
// シーケンシャルトランザクション
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'user@example.com', name: 'John' } }),
  prisma.post.create({ data: { title: 'Title', content: 'Content', authorId: '123' } }),
]);

// インタラクティブトランザクション
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'user@example.com', name: 'John' },
  });

  const post = await tx.post.create({
    data: { title: 'Title', content: 'Content', authorId: user.id },
  });

  return { user, post };
});
```

### 生SQL（最終手段）

```typescript
// 生クエリ実行
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email LIKE ${'%@example.com'}
`;

// 実行のみ（結果不要）
await prisma.$executeRaw`
  UPDATE users SET is_active = true WHERE created_at < NOW() - INTERVAL '30 days'
`;
```

## パフォーマンス最適化

### N+1問題の回避

```typescript
// Bad: N+1問題
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
  });
}

// Good: include使用
const users = await prisma.user.findMany({
  include: {
    posts: true,
  },
});
```

### 必要なフィールドのみ取得

```typescript
// Bad: 全フィールド取得
const users = await prisma.user.findMany();

// Good: selectで必要なフィールドのみ
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
});
```

### インデックスの活用

```prisma
// よく検索されるフィールドにインデックス
model User {
  email String

  @@index([email])
}
```

## シーディング

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { email: 'user1@example.com', name: 'User 1' },
      { email: 'user2@example.com', name: 'User 2' },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

```bash
# シード実行
pnpm prisma db seed
```

## Prisma Studio

```bash
# GUI起動
pnpm prisma studio
```

ブラウザで `http://localhost:5555` にアクセス
