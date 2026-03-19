# Web Template プロジェクトドキュメント

このディレクトリには、web_template プロジェクトの開発に必要な全てのドキュメントが整理されています。

## 🚀 今すぐ始める

**[クイックスタートガイド](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/QUICK_START.md)** - 5分で開発環境を構築

---

## プロジェクト基本情報

### プロジェクト概要
React + TypeScript のフロントエンドと、Hono + Prisma のバックエンドを持つフルスタック Web アプリケーションテンプレート。

### 主要技術スタック
- **フロントエンド**: React 19、TypeScript、Vite、React Router v7
- **バックエンド**: Hono、Prisma ORM、Zod OpenAPI
- **データベース**: PostgreSQL
- **オブジェクトストレージ**: MinIO (S3互換)
- **データフェッチング**: SWR、nuqs（URL状態管理）
- **UI**: shadcn/ui、TanStack Table、TailwindCSS v4
- **ビルドツール**: Vite、pnpm workspace

---

## ドキュメント一覧

### 1. README.md
プロジェクトの基本情報、クイックスタート、技術スタックの概要

**場所**: [README.md](https://github.com/TLPropStation/web_template/blob/main/README.md)

**内容**:
- プロジェクト構成（モノレポ構造）
- クイックスタートガイド
- 開発コマンド一覧
- 各種ドキュメントへのリンク

---

### 2. Setup.md
開発環境のセットアップ手順

**場所**: [docs/project-docs/Setup.md](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/Setup.md)

**内容**:
- 必須ツールのインストール
- プロジェクトのクローンとセットアップ
- データベースのセットアップ
- 環境変数の設定
- 開発サーバーの起動

---

### 3. OpenAPI 3.0仕様書
API エンドポイントの詳細仕様

**場所**: [docs/project-docs/OpenAPI-Spec.md](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/OpenAPI-Spec.md)

**Swagger UI（インタラクティブ）**: `http://localhost:3088/api/ui` (開発サーバー起動後)

**OpenAPI JSON**: `http://localhost:3088/api/doc` (開発サーバー起動後)

**内容**:
- API エンドポイント一覧
- リクエスト/レスポンス仕様
- 認証方式（Firebase Authentication + JWT）
- エラーハンドリング
- OpenAPI 3.0 仕様へのアクセス方法

---

### 4. ER図・テーブル定義書
データベース構造とテーブル定義

**場所**: [docs/project-docs/Database-Schema.md](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/Database-Schema.md)

**Prismaスキーマ**: [backend/prisma/schema.prisma](https://github.com/TLPropStation/web_template/blob/main/backend/prisma/schema.prisma)

**内容**:
- ER図（Mermaid形式）
- 全テーブル定義（カラム、型、制約）
- リレーション定義
- インデックス設計
- マイグレーション管理

---

### 5. 画面遷移図
**Figmaで作成予定のため本ドキュメントでは対象外**

---

### 6. アーキテクチャ設計書
システム全体のアーキテクチャと設計方針

**場所**: [.ai-guide/architecture.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/architecture.md)

**内容**:
- システム概要
- ディレクトリ構造
- レイヤードアーキテクチャ（Domain, Infrastructure, Presentation）
- データフェッチング戦略（SWR + nuqs）
- コンポーネント設計原則
- バックエンドの関数ベースアーキテクチャ
- パス エイリアスとインポート規約

---

### 7. AI利用ガイドライン
AIツールを使用した開発ガイドライン

**メインガイド**: [.ai-guide/index.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/index.md)

**AI関連ドキュメント**:
- **AIプロンプト集**: [.ai-guide/ai-prompts.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/ai-prompts.md)
- **AI制約事項**: [.ai-guide/ai-limitations.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/ai-limitations.md)
- **AI Guide作成ガイド**: [.ai-guide/ai-guide.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/ai-guide.md)

**内容**:
- AI開発支援の活用方法
- 推奨プロンプト集
- AI利用時の制約と注意点
- サブディレクトリのAI Guide作成方法

---

### 8. コーディング規約
コードスタイル、命名規則、品質基準

**場所**: [.ai-guide/coding-rules.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/coding-rules.md)

**内容**:
- コード品質基準（ESLint、Biome、TypeScript厳密モード）
- 命名規約（ファイル、ディレクトリ、変数、関数）
- バックエンド設計原則（関数ベースアーキテクチャ）
- コンポーネント設計原則
- データフェッチングパターン
- API クライアントの使用方法
- パフォーマンス考慮事項
- セキュリティ要件
- コミットメッセージ規則

---

### 9. テスト観点一覧
テスト戦略とテストケース一覧

**テスト戦略**: [.ai-guide/testing.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/testing.md)

**テスト観点一覧**: [docs/project-docs/Test-Scenarios.md](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/Test-Scenarios.md)

**内容**:
- テストの種類と粒度（ユニット、統合、E2E）
- テスト実行コマンド
- テスト作成のベストプラクティス
- カバレッジ基準
- 各機能のテストケース一覧

---

## その他の重要ドキュメント

### 開発フロー・ワークフロー
**場所**: [.ai-guide/workflow.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/workflow.md)

### 認証・認可システム
**場所**: [.ai-guide/authentication.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/authentication.md)

### データ取扱方針
**場所**: [.ai-guide/data-handling.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/data-handling.md)

### コミット・PR ガイドライン
**場所**: [.ai-guide/commit-and-pr.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/commit-and-pr.md)

### 環境構築ガイド
**場所**: [.ai-guide/environment.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/environment.md)

---

## ドキュメントメンテナンスルール

1. **更新頻度**: コード変更時には関連ドキュメントも同時に更新すること
2. **言語**: 全ドキュメントは日本語で記述（技術用語は英語可）
3. **フォーマット**: Markdown形式で記述
4. **リンク**: 他ドキュメントへのリンクは相対パスまたはフルパスで記載

---

## お問い合わせ

ドキュメントに関する質問や改善提案は、GitHubのIssueまたはPull Requestで受け付けています。
