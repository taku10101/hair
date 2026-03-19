# Web Template

React + TypeScript のWebアプリケーションテンプレート。フロントエンドとバックエンドを分離した、高速な開発環境です。

## プロジェクト構成

このプロジェクトは pnpm workspace を使用したモノレポ構造です：

- **[frontend](./frontend/)** - React + Vite + TypeScript フロントエンドアプリケーション
  - UI コンポーネント: shadcn/ui、TanStack Table
  - データフェッチング: SWR
  - スタイリング: TailwindCSS v4

- **[backend](./backend/)** - Hono + Prisma バックエンド API
  - Web フレームワーク: Hono
  - ORM: Prisma
  - API ドキュメント: Zod OpenAPI 

## クイックスタート

```bash
# 依存関係のインストール（ルートで一度実行）
pnpm install

# フロントエンドとバックエンドを並行起動
pnpm dev

# 全パッケージをビルド
pnpm build

# 全パッケージでテスト実行
pnpm test
```

### データベース関連コマンド

```bash
# backend ディレクトリで実行

# Prisma クライアントを生成
pnpm prisma:generate

# マイグレーションを実行
pnpm prisma:migrate

# Prisma Studio を起動（GUIでデータ編集）
pnpm prisma:studio

# データベーススキーマのMarkdownドキュメントを生成
pnpm prisma:docs
# → docs/database/schema.md にER図とテーブル定義が生成されます
```

## 開発ガイドライン

詳細な開発ガイドラインは [CLAUDE.md](./CLAUDE.md) を参照してください。

### プロジェクトドキュメント

包括的なプロジェクトドキュメントは [docs/project-docs/](./docs/project-docs/) ディレクトリにまとめています：

- **[プロジェクトドキュメント総合案内](./docs/project-docs/README.md)** - 全ドキュメントの索引
- **[Setup.md](./docs/project-docs/Setup.md)** - 開発環境のセットアップ手順
- **[OpenAPI仕様書](./docs/project-docs/OpenAPI-Spec.md)** - API エンドポイントの詳細仕様
- **[データベーススキーマ](./docs/project-docs/Database-Schema.md)** - ER図とテーブル定義書
- **[テスト観点一覧](./docs/project-docs/Test-Scenarios.md)** - テストシナリオと観点

### 開発ドキュメント

#### 全体ガイド

[.ai-guide](./.ai-guide/index.md) ディレクトリに開発用のガイドを配置しています：

- [アーキテクチャ概要](./.ai-guide/architecture.md) - システム構成と設計方針
- [コーディング規約](./.ai-guide/coding-rules.md) - コードスタイルと命名規則
- [環境構築](./.ai-guide/environment.md) - 開発環境のセットアップ手順
- [テスト方針](./.ai-guide/testing.md) - テストの方針と実装方法
- [開発フロー](./.ai-guide/workflow.md) - 開発の進め方
- [データ取扱方針](./.ai-guide/data-handling.md) - データの扱い方
- [コミット・PR](./.ai-guide/commit-and-pr.md) - コミットとプルリクエストのガイドライン

#### AI 開発支援

- [AIプロンプト集](./.ai-guide/ai-prompts.md) - AI 活用のプロンプト例
- [AI制約事項](./.ai-guide/ai-limitations.md) - AI 利用時の注意点

#### パッケージ別ドキュメント

- **フロントエンド**: [ドキュメント一覧](./frontend/.ai-guide/index.md) - React コンポーネント、ルーティング、状態管理
- **バックエンド**: [ドキュメント一覧](./backend/.ai-guide/index.md) - API エンドポイント、ビジネスロジック、データベース

## ライセンス

MIT
