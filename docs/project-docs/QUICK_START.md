# クイックスタートガイド

このドキュメントは、Web Template プロジェクトの開発を今すぐ始めるための最速ガイドです。

---

## 🚀 5分で開発環境を構築

### 1. 前提条件の確認

以下がインストールされているか確認してください：
- Node.js 18.x以上
- pnpm 8.x以上
- PostgreSQL 14.x以上
- Docker & Docker Compose

詳細: [Setup.md](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/Setup.md)

### 2. プロジェクトのクローン

```bash
git clone https://github.com/TLPropStation/web_template.git
cd web_template
```

### 3. 依存関係のインストール

```bash
pnpm install
```

### 4. 環境変数の設定

```bash
# バックエンド
cd backend
cp .env.example .env
# .env を編集してデータベース接続情報を設定

# フロントエンド
cd ..
cp .env.local.example .env.local
# .env.local を編集してAPI URL等を設定
```

### 5. データベースのセットアップ

```bash
cd backend
pnpm prisma:generate
pnpm prisma:migrate
```

### 6. MinIOの起動

```bash
cd backend
docker-compose up -d
```

### 7. 開発サーバーの起動

```bash
# ルートディレクトリに戻る
cd ..

# フロントエンドとバックエンドを並行起動
pnpm dev
```

### 8. 動作確認

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:3088
- Swagger UI: http://localhost:3088/api/ui
- MinIO Web UI: http://localhost:9001

---

## 📚 主要ドキュメントへのリンク

### 開発を始める前に読むべきドキュメント

1. **[プロジェクトドキュメント総合案内](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/README.md)**
   - 全ドキュメントの索引

2. **[アーキテクチャ設計書](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/architecture.md)**
   - システム全体の構造を理解

3. **[コーディング規約](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/coding-rules.md)**
   - コードスタイルと命名規則

### API開発時に参照

4. **[OpenAPI仕様書](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/OpenAPI-Spec.md)**
   - 全エンドポイントの詳細仕様
   - Swagger UI: http://localhost:3088/api/ui

5. **[データベーススキーマ](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/Database-Schema.md)**
   - ER図とテーブル定義

### テスト実行時に参照

6. **[テスト観点一覧](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/Test-Scenarios.md)**
   - 全機能のテストケース

7. **[テスト戦略](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/testing.md)**
   - テストの実行方法

---

## 🔧 よく使うコマンド

### 開発

```bash
# 全パッケージの開発サーバーを起動
pnpm dev

# フロントエンドのみ
cd frontend && pnpm dev

# バックエンドのみ
cd backend && pnpm dev
```

### テスト

```bash
# 全パッケージでテスト実行
pnpm test

# フロントエンドのみ
cd frontend && pnpm test

# バックエンドのみ
cd backend && pnpm test
```

### ビルド

```bash
# 全パッケージをビルド
pnpm build

# 型チェック
pnpm typecheck

# リント
pnpm lint
```

### データベース

```bash
cd backend

# Prisma Client生成
pnpm prisma:generate

# マイグレーション実行
pnpm prisma:migrate

# Prisma Studio起動（データベースGUI）
pnpm prisma:studio
```

---

## 🆘 トラブルシューティング

問題が発生した場合は、以下のドキュメントを参照してください：

- **[Setup.md - トラブルシューティング](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/Setup.md#トラブルシューティング)**
- **[環境構築ガイド](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/environment.md)**

---

## 📖 詳細ドキュメント

より詳しい情報は、以下のドキュメントを参照してください：

- **[プロジェクトドキュメント総合案内](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/README.md)** - 全ドキュメントの索引
- **[開発フロー](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/workflow.md)** - 開発の進め方
- **[コミット・PR ガイドライン](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/commit-and-pr.md)** - Gitの使い方

---

## 🎯 次のステップ

環境構築が完了したら：

1. [アーキテクチャ設計書](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/architecture.md)でシステム全体を理解
2. [コーディング規約](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/coding-rules.md)でコードスタイルを確認
3. [Swagger UI](http://localhost:3088/api/ui)でAPI仕様を確認
4. サンプル機能を実装してみる

Happy Coding! 🚀
