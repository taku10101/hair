# Architecture Overview

## プロジェクト概要

これは React + TypeScript のフロントエンドと、Hono + Prisma のバックエンドを持つフルスタック Web アプリケーションテンプレートです。迅速なプロトタイピングのために json-server によるモック REST API も提供しています。SWR によるデータフェッチング、TanStack Table によるデータ表示、nuqs による URL ベースの状態管理を特徴としています。

## 技術スタック

- **フロントエンド**: React 19、TypeScript、Vite、React Router v7
- **バックエンド**: Hono、Prisma ORM、Zod OpenAPI
- **データフェッチング**: SWR、nuqs（URL 状態管理）
- **UI コンポーネント**: shadcn/ui、TanStack Table、TailwindCSS v4
- **モック API**: json-server、faker.js
- **オブジェクトストレージ**: MinIO（S3互換）
- **ビルドツール**: Vite、pnpm
- **リンター/フォーマッター**: ESLint（フロントエンド）、Biome（バックエンド）

## ディレクトリ構造

プロジェクトは pnpm workspace を使用したモノレポ構造で、フロントエンドとバックエンドが明確に分離されています：

```
web_template/
├── pnpm-workspace.yaml     # pnpm ワークスペース設定
├── package.json            # ワークスペース全体のスクリプト
├── frontend/          # React アプリケーション
│   └── src/
│       ├── components/
│       │   ├── ui/              # shadcn/ui コンポーネント（Button、Table など）
│       │   ├── table/           # DataTable と関連コンポーネント
│       │   ├── filters/         # 再利用可能なフィルターコンポーネント
│       │   ├── layout/          # レイアウトとナビゲーションコンポーネント
│       │   └── form/            # フォームコンポーネント
│       ├── routes/              # ページコンポーネント（home、users、not-found）
│       │   └── {route}/
│       │       ├── index.tsx             # メインページコンポーネント
│       │       ├── components/           # ルート固有のコンポーネント
│       │       └── hooks/               # ルート固有のフック
│       ├── hooks/               # 汎用カスタムフック
│       ├── lib/                 # ユーティリティ関数と API クライアント
│       ├── mock/                # モックデータ生成
│       │   ├── types/           # モックデータの TypeScript インターフェース
│       │   ├── generators/      # faker.js を使ったデータジェネレータ関数
│       │   └── data/            # json-server 用に生成された db.json
│       ├── App.tsx              # React Router セットアップ
│       └── main.tsx             # NuqsAdapter を含むエントリポイント
└── backend/           # Hono アプリケーション
    └── src/
        ├── domain/              # ドメインロジックとビジネスルール
        ├── infrastructure/      # データアクセスレイヤー（Prisma）
        ├── presentation/        # API ルートとコントローラー
        ├── lib/                 # ユーティリティ関数
        └── index.ts             # Hono アプリエントリポイント
```

## 主要なアーキテクチャパターン

### 1. データフェッチングと状態管理（SWR + nuqs）

**SWR によるデータフェッチング**
- 各ルートは独自の SWR フック（例：`routes/user/hooks/useUsersData.ts` の `useUsers`）を持つ
- `frontend/src/lib/api-client.ts` の `fetcher` 関数がすべての HTTP リクエストを処理
- 共通 API 型（`QueryParams`、`PaginatedResponse`）は `frontend/src/lib/apiTypes.ts` で定義
- API ベース URL は `VITE_API_BASE_URL` 環境変数で設定可能（デフォルト: `http://localhost:3088`）

**URL ベースの状態管理（nuqs）**
- `nuqs` ライブラリによる URL クエリパラメータ管理
- ページネーション、フィルタリング、ソート状態を URL パラメータに永続化
- `frontend/src/hooks/usePaginationState.ts` の `usePaginationState` フックが URL でページネーションを管理
- フィルターや ページ状態を保持した共有可能なリンクを実現

### 2. バックエンド API 統合

**本番環境**
- バックエンド API（Hono + Prisma）と統合
- `authenticatedFetch` 関数で Firebase 認証トークンを自動付与
- API ベース URL は `VITE_API_BASE_URL` 環境変数で設定（デフォルト: `http://localhost:3088`）

**モックデータ生成システム（開発用・オプション）**
- TypeScript インターフェースが `frontend/src/mock/types/` でデータ構造を定義
- ジェネレータ関数が `@faker-js/faker` を使ってリアルなモックデータを作成
- `pnpm mock:generate` で TypeScript インターフェースから `db.json` を再生成
- モックサーバーは開発時のテスト用途として利用可能

### 3. テーブルコンポーネントアーキテクチャ

- `DataTable` コンポーネント（`frontend/src/components/table/DataTable.tsx`）は TanStack Table の再利用可能なラッパー
- ページネーション、ソート、行選択、カスタムレンダリングをサポート
- 制御モード（URL 管理）と非制御モード（内部状態）で動作可能
- 行選択には `createSelectColumn()` ヘルパーを使用
- ソート可能なカラムには `SortableHeader` コンポーネントを使用

### 4. フィルターコンポーネント

- `frontend/src/components/filters/` に再利用可能なフィルターコンポーネント
- コンポーネント：`SearchFilter`、`SelectFilter`、`MultiSelectFilter`、`DateRangeFilter`、`NumberRangeFilter`
- すべてのフィルターが `nuqs` と統合され URL パラメータ管理を実現
- 実装パターンは `filter-demo.tsx` と `example-usage.tsx` を参照

### 5. バックエンドレイヤードアーキテクチャ

- **Domain レイヤー**: ビジネスロジックとエンティティ
- **Infrastructure レイヤー**: データベースリポジトリと外部サービス（Prisma、MinIO）
- **Presentation レイヤー**: HTTP ハンドラーとルート定義
- **関数ベースアーキテクチャ**: クラスではなくファクトリー関数とクロージャを使用（詳細は `backend/.ai-guide/function-based-architecture.md` を参照）
- Zod OpenAPI による API ドキュメントとバリデーション
- 型安全なデータベースアクセスのための Prisma ORM
- MinIO によるS3互換オブジェクトストレージ（詳細は `backend/.ai-guide/storage.md` を参照）

### 6. パス エイリアスとインポート規約

- `@/*` は `frontend/src/*` に解決
- `@components/*` は `frontend/src/components/*` に解決
- `vite.config.ts` と `tsconfig.json` で設定

### 7. スタイリング

- TailwindCSS v4 と `@tailwindcss/vite` プラグイン
- `frontend/src/components/ui/` の shadcn/ui コンポーネント
- 条件付きクラスマージには `frontend/src/lib/utils.ts` の `cn()` ユーティリティを使用

### 8. ルーティング

- React Router v7 と BrowserRouter
- Layout コンポーネントがすべてのルートをラップ
- `App.tsx` でルート定義
- ページコンポーネントは `frontend/src/routes/index.ts` からエクスポート

## コンポーネント設計原則

### 汎用 vs ルート固有コンポーネント

**汎用コンポーネント（`components/`）**
複数のルートやコンテキストで再利用可能なコンポーネント：
- `DataTable` - あらゆるデータ型に使える再利用可能なテーブル
- フィルターコンポーネント - あらゆるエンティティで使える検索/選択フィルター
- shadcn/ui コンポーネント - ボタン、ダイアログなどの UI プリミティブ

**ルート固有コンポーネント（`routes/{route}/components/`）**
単一のルートや機能に固有のコンポーネント：
- テーブルカラム定義（例：`UserTableColumns.tsx`）
- フィルター設定（例：`UserFilters.ts`）
- ルート固有の UI コンポーネント

### カスタムフックの組織化

**汎用フック（`hooks/`）**
- `usePaginationState.ts` - 汎用ページネーション
- `useClientSideFiltering.ts` - 汎用フィルタリング

**ルート固有フック（`routes/{route}/hooks/`）**
- `useUsersData.ts` - ユーザーデータフェッチング
- 各ルートがデータフェッチングロジックを独自に管理

### 型の組織化

- **汎用型**（`lib/apiTypes.ts`）: `QueryParams`、`PaginatedResponse` など
- **データモデル型**（`mock/types/`）: `User`、`Post` などの共有データモデル
- **ルート固有型**: ルート内でインラインまたは専用の `types/` ディレクトリ

## 開発ワークフロー

### ワークスペース全体

pnpm workspace を使用しているため、ルートディレクトリから全てのパッケージのコマンドを実行できます。

```bash
# ルートディレクトリで実行
pnpm dev              # 全パッケージの開発サーバーを並行起動
pnpm build            # 全パッケージをビルド
pnpm typecheck        # 全パッケージで型チェック
pnpm lint             # 全パッケージでリント実行
pnpm test             # 全パッケージでテスト実行
```

### フロントエンド開発

```bash
cd frontend
pnpm dev              # 開発サーバー起動（Vite）
pnpm build            # 型チェックとプロダクションビルド
pnpm lint             # ESLint 実行
pnpm preview          # プロダクションビルドのプレビュー
```

### バックエンド開発

```bash
cd backend
pnpm dev              # 開発サーバー起動（tsx watch）
pnpm build            # TypeScript ビルド
pnpm start            # プロダクションサーバー起動
pnpm typecheck        # 型チェックのみ
pnpm lint             # Biome によるリント
pnpm format           # Biome によるフォーマット
pnpm prisma:generate  # Prisma Client 生成
pnpm prisma:migrate   # マイグレーション実行
pnpm prisma:studio    # Prisma Studio を開く
```

### モック API サーバー

```bash
cd frontend
pnpm mock:generate    # TypeScript インターフェースからモックデータ生成
pnpm mock:server      # ポート 3088 で json-server 起動
pnpm mock:dev         # データ生成とサーバー起動
```

## 重要な注意事項

- **pnpm workspace**: ルートディレクトリで `pnpm install` を実行すると全パッケージの依存関係がインストールされる
- **ワークスペースコマンド**: ルートから `pnpm dev` で全パッケージを並行起動可能
- `main.tsx` で NuqsAdapter がアプリをラップ - nuqs による URL 状態管理に必須
- ページネーションシステムは 1 ベース（nuqs/URL）と 0 ベース（TanStack Table）のインデックスを変換
- モックデータは `pnpm mock:generate` 実行ごとに再生成される - `db.json` への変更は永続化されない
- フロントエンドとバックエンドは独立したアプリケーション - 開発時は個別に実行可能
- バックエンドは Prisma を使用 - スキーマ変更後は `pnpm prisma:generate` を実行
- パッケージマネージャーは pnpm - すべてのコマンドで `npm` や `yarn` ではなく `pnpm` を使用
- **オブジェクトストレージ**: MinIO を Docker Compose で起動 - `backend/docker-compose.yml` でポート 9000 (API) と 9001 (Web UI) を公開
