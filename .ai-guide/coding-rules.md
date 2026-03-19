# コーディング規約とガイドライン

このドキュメントでは、web_template プロジェクトにおけるコーディング規約、品質基準、および開発時の指針を定義します。

## コード品質基準

### TypeScript コード（フロントエンド）

- **Biome による統合リント・フォーマット**
  - 設定ファイル: `frontend/biome.json`
  - リント: `cd frontend && pnpm lint`（またはルートで `pnpm lint`）
  - フォーマット: `cd frontend && pnpm format`（またはルートで `pnpm format`）
  - 自動修正: `cd frontend && pnpm lint:fix`（またはルートで `pnpm lint:fix`）
- **TypeScript 厳密モード**
  - `strict: true` を使用
  - `tsconfig.json` で設定
  - コマンド: `cd frontend && pnpm build`（またはルートで `pnpm typecheck`）
- **`any` 型の使用は禁止**
  - 適切な型定義または `unknown` 型を使用
  - 型ガードで安全に処理すること

### TypeScript コード（バックエンド）

- **Biome による統合リント・フォーマット**
  - 設定ファイル: `backend/biome.json`
  - リント: `cd backend && pnpm lint`（またはルートで `pnpm lint`）
  - フォーマット: `cd backend && pnpm format`
  - チェック: `cd backend && pnpm biome:check`
  - 自動修正: `cd backend && pnpm biome:check:write`
- **TypeScript 厳密モード**
  - 型チェック: `cd backend && pnpm typecheck`（またはルートで `pnpm typecheck`）

### CSS/スタイリング

- **TailwindCSS v4 を使用**
  - 設定: `frontend/src/app.css` で `@import "tailwindcss";`
  - Vite プラグイン: `@tailwindcss/vite`
- **クラス名の条件付きマージ**
  - `cn()` ユーティリティ（`frontend/src/lib/utils.ts`）を使用
  - clsx と tailwind-merge の組み合わせ

## 命名規約

### ファイル命名

**コンポーネントファイル（PascalCase）**
```
ComponentName.tsx          # React コンポーネント
UserTableColumns.tsx       # テーブルカラム定義
FilterForm.tsx            # フォームコンポーネント
```

**ユーティリティとフックファイル（camelCase）**
```
useHookName.ts            # カスタムフック
usePaginationState.ts     # ページネーションフック
apiClient.ts              # API クライアント
utils.ts                  # ユーティリティ関数
```

**特殊ファイル（lowercase with hyphens）**
```
vite.config.ts            # 設定ファイル
tsconfig.json             # TypeScript 設定
package.json              # パッケージ設定
generate-db.ts            # スクリプト
```

### ディレクトリ命名

```
routes/user/              # ルートディレクトリ（lowercase with hyphens）
components/table/         # コンポーネントカテゴリ（lowercase）
routes/user/components/   # サブディレクトリ（lowercase）
```

### 変数と関数の命名

**コンポーネントと JSX**
```typescript
// PascalCase
export function UserTableColumns() { ... }
export const DataTable = () => { ... }

// Props: camelCase
interface DataTableProps {
  pageSize: number
  onPaginationChange: (state: PaginationState) => void
}
```

**フックと関数**
```typescript
// カスタムフック: camelCase + 'use' プレフィックス
export function useUsers() { ... }
export const usePaginationState = () => { ... }

// 通常の関数: camelCase
export function buildQueryString(params: QueryParams) { ... }
const handleSubmit = () => { ... }
```

**バックエンド: ファクトリー関数**
```typescript
// ファクトリー関数: camelCase + 'create' プレフィックス
export const createUserService = (repo: IUserRepository) => { ... }
export const createStorageController = (service: StorageService) => { ... }

// 型定義: ReturnType で自動推論
export type UserService = ReturnType<typeof createUserService>
export type StorageController = ReturnType<typeof createStorageController>
```

**定数と設定**
```typescript
// camelCase または UPPER_SNAKE_CASE
const filterConfigs: FilterConfig[] = [ ... ]
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// エクスポート定数: camelCase 推奨
export const userFilterConfigs = [ ... ]
export const postColumns = [ ... ]
```

## バックエンド設計原則

### 関数ベースアーキテクチャ

**詳細は `backend/.ai-guide/function-based-architecture.md` を参照してください。**

**ファクトリー関数の実装パターン**
```typescript
// ✅ Good: ファクトリー関数パターン
export const createUserService = (userRepository: IUserRepository) => {
  // プライベート関数（クロージャ内）
  const validateUser = (user: User): void => {
    if (!user.email) throw new Error("Email is required");
  };

  // 公開API
  return {
    async createUser(data: CreateUserDto): Promise<User> {
      validateUser(data);
      return await userRepository.create(data);
    },

    async getUser(id: number): Promise<User | null> {
      return await userRepository.findById(id);
    },
  };
};

// 型推論を活用
export type UserService = ReturnType<typeof createUserService>;

// ❌ Bad: クラスベースパターン（使用禁止）
export class UserService {
  constructor(private userRepository: IUserRepository) {}
  // ...
}
```

**依存性注入のパターン**
```typescript
// ✅ Good: 依存を明示的にパラメータで受け取る
export const createStorageService = (
  storageRepository: IStorageRepository
) => {
  return {
    async uploadFile(file: Buffer, metadata: FileMetadata) {
      return await storageRepository.uploadFile(file, metadata);
    },
  };
};

// ❌ Bad: グローバル変数やシングルトンに依存
export const createStorageService = () => {
  const repo = getGlobalRepository(); // テスト困難
  // ...
};
```

**レイヤー間の依存関係**
```
index.ts (Composition Root)
    ↓ 依存を組み立て
Presentation (Controller) → Domain (Service) → Infrastructure (Repository)
                                ↓ インターフェース
                         IRepository (抽象)
```

- Presentationレイヤーは Domainレイヤーに依存
- Domainレイヤーは リポジトリインターフェース（抽象）に依存
- Infrastructureレイヤーが インターフェースを実装

## コンポーネント設計原則

### 汎用コンポーネント vs ルート固有コンポーネント

**汎用コンポーネント（`components/` に配置）**
- 2つ以上のルートで再利用される
- ビジネスロジックを持たない純粋な UI コンポーネント
- props で設定可能

```typescript
// ✅ 汎用 - components/table/
export function DataTable<TData>({ ... }) { ... }

// ✅ 汎用 - components/filters/
export function SearchFilter({ ... }) { ... }

// ✅ 汎用 - components/ui/
export function Button({ ... }) { ... }
```

**ルート固有コンポーネント（`routes/{route}/components/` に配置）**
- 単一のルートや機能に固有
- ルート固有のデータ構造を含む
- 再利用の可能性が低い

```typescript
// ✅ ルート固有 - routes/user/components/
export const userColumns: ColumnDef<User>[] = [ ... ]

// ✅ ルート固有 - routes/posts/components/
export const postFilterConfigs: FilterConfig[] = [ ... ]
```

### ルート構造パターン

```
routes/{route}/
├── index.tsx                      # メインページコンポーネント
├── components/
│   ├── {Route}TableColumns.tsx   # テーブルカラム定義
│   ├── {Route}Filters.ts         # フィルター設定
│   └── {Route}SpecificComponent.tsx  # その他のルート固有コンポーネント
└── hooks/
    └── use{Route}Data.ts         # ルート固有のデータフェッチングフック
```

## 開発タスクのガイドライン

### 新しいフロントエンドページの追加

1. `frontend/src/routes/` にページコンポーネントを作成
2. `frontend/src/routes/index.ts` からエクスポート
3. `App.tsx` にルートを追加
4. `frontend/src/components/layout/navigation.tsx` にナビゲーションリンクを追加

### 新しい API エンドポイントの追加（モック・開発用）

**注意: 本番環境ではバックエンドAPIを使用します。モックサーバーは開発・テスト目的でのみ使用してください。**

1. `frontend/src/mock/types/` に TypeScript インターフェースを定義
2. `frontend/src/mock/generators/` にジェネレータを作成
3. `generate-db.ts` の `generateDatabase()` に追加
4. `pnpm mock:generate` を実行
5. ルートの hooks ディレクトリに SWR フックを作成（例：`routes/{route}/hooks/use{Route}Data.ts`）

### 新しい API エンドポイントの追加（バックエンド）

**重要: バックエンドは関数ベースアーキテクチャを採用しています。詳細は `backend/.ai-guide/function-based-architecture.md` を参照してください。**

1. **Domain層の設計**
   - `backend/src/domain/entities/` にエンティティクラスを定義
   - `backend/src/domain/repositories/` にリポジトリインターフェースを作成
   - `backend/src/domain/services/` にサービス（ファクトリー関数）を実装
   - `backend/src/domain/schemas/` にZodスキーマとOpenAPI仕様を定義

2. **Prismaスキーマの更新**
   - `backend/prisma/schema.prisma` にデータモデルを追加
   - `pnpm prisma:generate` でクライアント生成
   - `pnpm prisma:migrate` でマイグレーション実行

3. **Infrastructure層の実装**
   - `backend/src/infrastructure/repositories/` にリポジトリ実装（ファクトリー関数）を作成
   - 外部サービス（MinIO等）の統合が必要な場合は設定

4. **Presentation層の構築**
   - `backend/src/presentation/controllers/` にコントローラー（ファクトリー関数）を作成
   - `backend/src/presentation/routes/` にルート定義とOpenAPI統合を追加

5. **依存性の組み立て**
   - `backend/src/index.ts` で依存関係を構築（リポジトリ → サービス → コントローラー）
   - ルートの登録

**実装例:**
- Storage機能: `backend/src/domain/services/StorageService.ts`、`backend/src/presentation/controllers/storage.controller.ts`
- User機能: `backend/src/domain/services/UserService.ts`、`backend/src/presentation/controllers/user.controller.ts`

### shadcn/ui コンポーネントの追加

- コンポーネントは `frontend/src/components/ui/` に手動でコピー
- このプロジェクトは shadcn CLI を使用しない

## データフェッチングのパターン

### SWR フックの作成

```typescript
// routes/user/hooks/useUsersData.ts
import useSWR from "swr"
import type { QueryParams } from "@/lib/apiTypes"
import type { User } from "@/mock/types"

export function useUsers(params?: QueryParams) {
  const { data, error, isLoading, mutate } = useSWR<User[]>(
    params ? ["/users", params] : "/users"
  )

  return {
    users: data,
    isLoading,
    isError: error,
    mutate
  }
}

export function useUser(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR<User>(
    id ? `/users/${id}` : null
  )

  return {
    user: data,
    isLoading,
    isError: error,
    mutate
  }
}
```

### URL 状態管理（nuqs）

```typescript
// ページネーション状態
import { usePaginationState } from "@/hooks/usePaginationState"

const { page, pageSize, setPage, setPageSize } = usePaginationState()

// フィルター状態
import { useQueryState } from "nuqs"

const [search, setSearch] = useQueryState("q", { defaultValue: "" })
const [status, setStatus] = useQueryState("status")
```

## API クライアントの使用

### 認証付きAPIリクエスト（推奨）

```typescript
// frontend/src/lib/apiClient.ts の authenticatedFetch を使用
import { authenticatedFetch, buildQueryString } from "@/lib/apiClient"

// GET リクエスト
const users = await authenticatedFetch<User[]>("/api/users")

// POST リクエスト
const newUser = await authenticatedFetch<User>("/api/users", {
  method: "POST",
  body: JSON.stringify(userData)
})

// PATCH リクエスト
await authenticatedFetch(`/api/users/${id}`, {
  method: "PATCH",
  body: JSON.stringify(updateData)
})

// パラメータ付き GET リクエスト
const queryString = buildQueryString({ page: 1, limit: 10 })
const data = await authenticatedFetch<User[]>(`/api/users${queryString}`)
```

### SWRとの統合

```typescript
import useSWR from "swr"
import { authenticatedFetch } from "@/lib/apiClient"

const authenticatedFetcher = async (url: string) => {
  return authenticatedFetch<User[]>(url)
}

export function useUsers() {
  const { data, error, isLoading } = useSWR<User[]>(
    "/api/users",
    authenticatedFetcher
  )

  return { users: data, isLoading, isError: error }
}
```

## パフォーマンスの考慮事項

- **フロントエンド**
  - Vite のコード分割を活用
  - React.lazy と Suspense による遅延読み込み
  - SWR のキャッシュ戦略を活用
  - 不要な再レンダリングを防ぐ（useMemo、useCallback）

- **バックエンド**
  - Prisma のクエリ最適化
  - 適切なインデックス設計
  - ページネーションの実装
  - レスポンスキャッシング

## セキュリティ要件

- すべての API エンドポイントで入力検証を実施
- XSS 保護のために適切なエスケープを使用
- CORS 設定を適切に構成
- 環境変数に機密情報を保存（`.env` ファイル、リポジトリにコミットしない）
- Prisma による SQL インジェクション保護

## テスト戦略

### フロントエンド
- コンポーネントテスト: Vitest + React Testing Library
- E2E テスト: Playwright（推奨）

### バックエンド
- ユニットテスト: Vitest
- API テスト: Hono のテストユーティリティ
- Prisma のテストデータベース分離

## コミットメッセージの規則

```
<type>: <subject>

<body>

<footer>
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: フォーマット変更（コード動作に影響なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセスやツール変更

**例:**
```
feat: add user profile page

- Create UserProfile component
- Add profile data fetching hook
- Implement profile edit form

Closes #123
```

## コードレビューのポイント

1. **コードの品質**
   - 命名規約に従っているか
   - 適切な型定義があるか
   - `any` 型を使用していないか

2. **アーキテクチャ**
   - コンポーネントが適切な場所に配置されているか
   - 責任の分離ができているか
   - 再利用性を考慮しているか

3. **パフォーマンス**
   - 不要な再レンダリングがないか
   - データフェッチングが最適化されているか

4. **セキュリティ**
   - 入力検証が実装されているか
   - 機密情報がハードコードされていないか

5. **テスト**
   - 適切なテストカバレッジがあるか

## ツールと設定

### リント・フォーマット

**ワークスペース全体:**
```bash
# ルートディレクトリで実行
pnpm lint              # 全パッケージでリント実行
pnpm lint:fix          # 全パッケージでリント自動修正
pnpm format            # 全パッケージでフォーマット
```

**フロントエンド:**
```bash
cd frontend
pnpm lint              # Biome リント
pnpm lint:fix          # Biome リント自動修正
pnpm format            # Biome フォーマット
```

**バックエンド:**
```bash
cd backend
pnpm lint              # Biome リント
pnpm lint:fix          # Biome リント自動修正
pnpm format            # Biome フォーマット
```

### 型チェック

**ワークスペース全体:**
```bash
# ルートディレクトリで実行
pnpm typecheck         # 全パッケージで型チェック
pnpm build             # 全パッケージをビルド
```

**個別のパッケージ:**
```bash
# フロントエンド
cd frontend && pnpm build  # ビルド時に型チェック

# バックエンド
cd backend && pnpm typecheck
```

### Git フック（Lefthook）

プロジェクトは Lefthook を使用して pre-commit フックを管理：
- 自動的にリント・フォーマットを実行
- 型チェックを実行
- コミット前に品質を保証

設定: `lefthook.yml`

## 重要な注意事項

- **パッケージマネージャー**: `pnpm` を使用（`npm` や `yarn` は使用しない）
- **モックデータ**: `pnpm mock:generate` 実行ごとに再生成される
- **Prisma**: スキーマ変更後は必ず `pnpm prisma:generate` を実行
- **環境変数**: `.env` ファイルはリポジトリにコミットしない（`.env.example` をテンプレートとして使用）
- **URL 状態管理**: `NuqsAdapter` が `main.tsx` で必須
