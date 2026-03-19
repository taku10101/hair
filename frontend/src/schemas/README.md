# スキーマ管理 (Zod Schemas)

このディレクトリは、フロントエンドで使用するすべてのZodスキーマを一元管理します。

## 目的

- **フォームバリデーション**: React Hook Formと連携してフォーム入力を検証
- **APIレスポンス検証**: バックエンドからのレスポンスの型安全性を確保
- **データ変換**: 外部データを内部形式に変換
- **型の一元管理**: TypeScript型をZodスキーマから自動生成

## ディレクトリ構造

```
schemas/
├── README.md              # このファイル
├── index.ts               # すべてのスキーマをエクスポート
├── auth.schema.ts         # 認証関連スキーマ
├── common.schema.ts       # 共通スキーマとヘルパー
└── *.schema.ts            # 機能ごとのスキーマファイル
```

## 基本的な使い方

### 1. フォームバリデーション

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/schemas";

export const useLoginForm = () => {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    // data は型安全に保証されている
    console.log(data);
  };

  return { form, onSubmit };
};
```

### 2. APIレスポンスの検証

```typescript
import { authUserSchema, type AuthUser } from "@/schemas";

const fetchUser = async (): Promise<AuthUser> => {
  const response = await fetch("/api/user");
  const data = await response.json();

  // レスポンスを検証して型安全に
  return authUserSchema.parse(data);
};
```

### 3. 条件付きバリデーション

```typescript
import { z } from "zod";

export const conditionalSchema = z.object({
  type: z.enum(["email", "phone"]),
  contact: z.string(),
}).refine(
  (data) => {
    if (data.type === "email") {
      return z.string().email().safeParse(data.contact).success;
    }
    return true;
  },
  {
    message: "有効なメールアドレスを入力してください",
    path: ["contact"],
  }
);
```

## 命名規則

### スキーマファイル

- `*.schema.ts`: 機能名 + `.schema.ts`
- 例: `auth.schema.ts`, `user.schema.ts`, `post.schema.ts`

### スキーマ変数

- **フォームスキーマ**: `{機能}Schema`
  - 例: `loginSchema`, `signupSchema`
- **APIレスポンススキーマ**: `{リソース}ResponseSchema`
  - 例: `userResponseSchema`, `postListResponseSchema`
- **APIリクエストスキーマ**: `{リソース}RequestSchema`
  - 例: `createUserRequestSchema`, `updatePostRequestSchema`

### 型定義

```typescript
// Zodスキーマから型を自動生成
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

## 共通スキーマ (common.schema.ts)

再利用可能なバリデーションヘルパーを提供します。

```typescript
import { requiredString, email, positiveInt } from "@/schemas";

const userSchema = z.object({
  name: requiredString("名前を入力してください"),
  email: email(),
});
```

## ページネーション

```typescript
import { paginationQuerySchema, paginationResponseSchema } from "@/schemas";

// リクエスト
const querySchema = paginationQuerySchema; // { page: number, limit: number }

// レスポンス
const userListSchema = paginationResponseSchema(userSchema);
// { data: User[], total: number, page: number, limit: number, totalPages: number }
```

## エラーハンドリング

```typescript
import { apiErrorSchema, type ApiError } from "@/schemas";

try {
  const data = await fetchData();
} catch (error) {
  if (isApiError(error)) {
    const apiError = apiErrorSchema.parse(error);
    console.error(apiError.message);
  }
}
```

## ベストプラクティス

### ✅ DO

- **Zodスキーマを単一のソースとして使用**
  ```typescript
  // スキーマから型を生成
  export type User = z.infer<typeof userSchema>;
  ```

- **バリデーションメッセージを日本語で記述**
  ```typescript
  z.string().min(1, "入力してください")
  ```

- **スキーマを細かく分割して再利用**
  ```typescript
  const emailField = z.string().email();
  const loginSchema = z.object({ email: emailField, password: z.string() });
  ```

### ❌ DON'T

- **スキーマと別に型を定義しない**
  ```typescript
  // ❌ Bad
  interface User { name: string; email: string; }
  const userSchema = z.object({ name: z.string(), email: z.string() });

  // ✅ Good
  const userSchema = z.object({ name: z.string(), email: z.string() });
  type User = z.infer<typeof userSchema>;
  ```

- **コンポーネント内でスキーマを定義しない**
  ```typescript
  // ❌ Bad
  const MyComponent = () => {
    const schema = z.object({ ... });
  }

  // ✅ Good
  // schemas/my-feature.schema.ts に定義
  ```

## 既存コードからの移行

1. バリデーションルールをZodスキーマに移行
2. React Hook Formに`zodResolver`を追加
3. コンポーネントから`rules` propsを削除

### Before

```typescript
<InputField
  name="email"
  rules={{
    required: "メールアドレスを入力してください",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "メールアドレスの形式が正しくありません",
    },
  }}
/>
```

### After

```typescript
// schemas/auth.schema.ts
export const loginSchema = z.object({
  email: z.string().min(1, "メールアドレスを入力してください")
    .email("メールアドレスの形式が正しくありません"),
  password: z.string().min(1, "パスワードを入力してください"),
});

// hooks/useLoginForm.ts
const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});

// Component
<InputField name="email" />
```

## 参考リンク

- [Zod公式ドキュメント](https://zod.dev/)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [@hookform/resolvers](https://github.com/react-hook-form/resolvers#zod)
