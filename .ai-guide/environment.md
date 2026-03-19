# 環境構築ガイド

このドキュメントでは、web_template の開発環境構築、設定、および実行方法について説明します。

## 必須要件

### システム要件

- **Node.js**: v18 以上（推奨: v20 LTS）
- **pnpm**: v8 以上
- **Git**: 最新版
- **エディター**: VS Code 推奨（または IntelliJ IDEA、Cursor など）

### オプション

- **Docker**: バックエンドデータベース（Prisma）を使用する場合
- **Playwright**: E2E テストを実行する場合

## 初期セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd web_template
```

### 2. pnpm のインストール

```bash
# npm 経由でグローバルインストール
npm install -g pnpm

# または Corepack を使用（Node.js 16.13+）
corepack enable
corepack prepare pnpm@latest --activate
```

### 3. 依存関係のインストール

このプロジェクトは pnpm workspace を使用しています。ルートディレクトリで一度インストールするだけで、全てのパッケージの依存関係がインストールされます。

```bash
# ルートディレクトリで実行（推奨）
pnpm install
```

### 4. 環境変数の設定

```bash
# フロントエンド
cd frontend
cp .env.example .env

# バックエンド
cd ../backend
cp .env.example .env
```

### 5. データベースのセットアップ（バックエンド使用時）

```bash
cd backend

# Prisma マイグレーション実行
pnpm prisma:migrate

# Prisma Client 生成
pnpm prisma:generate

# （オプション）Prisma Studio でデータベース確認
pnpm prisma:studio
```

## 開発サーバーの起動

### ワークスペース全体

pnpm workspace を使用しているため、ルートディレクトリから全てのパッケージのコマンドを実行できます。

```bash
# ルートディレクトリで実行

# フロントエンドとバックエンドを並行起動
pnpm dev
# → フロントエンド: http://localhost:5173
# → バックエンド: http://localhost:3000

# 全パッケージをビルド
pnpm build

# 全パッケージで型チェック
pnpm typecheck

# 全パッケージでリント実行
pnpm lint

# 全パッケージでテスト実行
pnpm test
```

### 個別のパッケージで開発

特定のパッケージのみ起動したい場合は、各ディレクトリで実行します。

#### フロントエンド開発

```bash
cd frontend

# 開発サーバー起動（Vite）
pnpm dev
# → http://localhost:5173

# 型チェック付きでビルド
pnpm build

# ビルドのプレビュー
pnpm preview
```

#### バックエンド開発

```bash
cd backend

# 開発サーバー起動（tsx watch）
pnpm dev
# → http://localhost:3000

# 本番ビルド
pnpm build

# 本番サーバー起動
pnpm start
```

### モック API サーバー

```bash
cd frontend

# モックデータ生成 + サーバー起動
pnpm mock:dev
# → http://localhost:3088

# モックデータのみ生成
pnpm mock:generate

# json-server のみ起動
pnpm mock:server
```

## 開発コマンド一覧

### フロントエンド（frontend/）

```bash
# 開発
pnpm dev              # 開発サーバー起動
pnpm build            # 型チェック + プロダクションビルド
pnpm preview          # ビルド結果のプレビュー

# コード品質
pnpm lint             # ESLint チェック
pnpm lint --fix       # ESLint 自動修正

# テスト
pnpm test             # Vitest ユニットテスト
pnpm test:watch       # ウォッチモード
pnpm test:ui          # Vitest UI モード
pnpm test:coverage    # カバレッジレポート

# E2E テスト
pnpm test:e2e         # Playwright E2E テスト
pnpm test:e2e:ui      # Playwright UI モード

# モック API
pnpm mock:dev         # モックデータ生成 + サーバー起動
pnpm mock:generate    # モックデータ生成のみ
pnpm mock:server      # json-server 起動のみ
```

### バックエンド（backend/）

```bash
# 開発
pnpm dev              # 開発サーバー起動（tsx watch）
pnpm build            # TypeScript ビルド
pnpm start            # プロダクションサーバー起動

# コード品質
pnpm lint             # Biome リント
pnpm format           # Biome フォーマット
pnpm typecheck        # 型チェックのみ
pnpm biome:check      # Biome チェックのみ
pnpm biome:check:write # Biome チェック + 自動修正

# テスト
pnpm test             # Vitest テスト
pnpm test:watch       # ウォッチモード
pnpm test:ui          # Vitest UI モード
pnpm test:coverage    # カバレッジレポート

# データベース（Prisma）
pnpm prisma:generate  # Prisma Client 生成
pnpm prisma:migrate   # マイグレーション実行
pnpm prisma:studio    # Prisma Studio 起動
pnpm prisma:seed      # シードデータ投入
pnpm prisma:reset     # データベースリセット
```

### ルートディレクトリ（ワークスペース全体）

```bash
# 開発
pnpm dev              # 全パッケージの開発サーバーを並行起動
pnpm build            # 全パッケージをビルド
pnpm typecheck        # 全パッケージで型チェック

# コード品質
pnpm lint             # 全パッケージでリント実行
pnpm lint:fix         # 全パッケージでリント自動修正

# テスト
pnpm test             # 全パッケージでテスト実行

# Git フック管理（Lefthook）
pnpm lefthook         # Lefthook コマンド実行
```

## 重要な設定ファイル

### フロントエンド

```
frontend/
├── vite.config.ts           # Vite ビルド設定
├── tsconfig.json            # TypeScript 設定
├── eslint.config.js         # ESLint 設定
├── tailwind.config.ts       # TailwindCSS 設定（存在する場合）
├── playwright.config.ts     # Playwright 設定（E2E テスト）
└── package.json             # 依存関係とスクリプト
```

### バックエンド

```
backend/
├── tsconfig.json            # TypeScript 設定
├── biome.json              # Biome 設定（リント・フォーマット）
├── prisma/
│   └── schema.prisma       # Prisma スキーマ定義
└── package.json            # 依存関係とスクリプト
```

### ルート

```
web_template/
├── pnpm-workspace.yaml     # pnpm ワークスペース設定
├── package.json            # ワークスペース全体のスクリプト
├── lefthook.yml            # Git フック設定
├── .gitignore              # Git 除外設定
└── CLAUDE.md               # Claude Code 用プロジェクト説明
```

## 環境変数

### フロントエンド（frontend/.env）

```bash
# API ベース URL
VITE_API_BASE_URL=http://localhost:3088

# その他のフロントエンド環境変数
# VITE_ プレフィックスが必要
```

### バックエンド（backend/.env）

```bash
# データベース接続文字列
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# アプリケーション設定
PORT=3000
NODE_ENV=development

# その他のバックエンド環境変数
```

**重要:** `.env` ファイルはリポジトリにコミットしないこと。`.env.example` をテンプレートとして使用。

## デバッグとトラブルシューティング

### よくある問題

#### ポート競合

```bash
# フロントエンド: 5173（Vite）
# バックエンド: 3000（Hono）
# モック API: 3088（json-server）

# ポートを確認
lsof -i :5173
lsof -i :3000
lsof -i :3088

# プロセスを終了
kill -9 <PID>
```

#### 依存関係の問題

```bash
# pnpm キャッシュクリア
pnpm store prune

# ワークスペース全体の node_modules を削除して再インストール
rm -rf node_modules frontend/node_modules backend/node_modules pnpm-lock.yaml
pnpm install
```

#### ビルドエラー

```bash
# TypeScript 型エラー
cd frontend && pnpm build
cd backend && pnpm typecheck

# Vite キャッシュクリア
rm -rf frontend/node_modules/.vite
```

#### Prisma の問題

```bash
# Prisma Client の再生成
cd backend
pnpm prisma:generate

# マイグレーションのリセット
pnpm prisma:reset

# データベース接続確認
pnpm prisma:studio
```

#### モックデータが更新されない

```bash
# モックデータを再生成
cd frontend
pnpm mock:generate
```

### デバッグモード

#### フロントエンド

- **React DevTools**: ブラウザ拡張機能をインストール
- **Vite DevTools**: 開発サーバー実行中は自動的にソースマップが有効
- **ブラウザコンソール**: `console.log` でデバッグ

#### バックエンド

```bash
# tsx デバッグモード
node --inspect node_modules/.bin/tsx src/index.ts

# または package.json に追加
{
  "scripts": {
    "dev:debug": "node --inspect node_modules/.bin/tsx watch src/index.ts"
  }
}
```

#### Vitest デバッグ

```bash
# UI モードで対話的にデバッグ
pnpm test:ui

# ブレークポイントを使用
# テストコード内に debugger を追加
```

## IDE 設定

### VS Code（推奨）

#### 推奨拡張機能

```json
// .vscode/extensions.json
{
  "recommendations": [
    "biomejs.biome",              // Biome（バックエンド）
    "dbaeumer.vscode-eslint",     // ESLint（フロントエンド）
    "bradlc.vscode-tailwindcss",  // TailwindCSS
    "Prisma.prisma",              // Prisma
    "ms-playwright.playwright",   // Playwright
    "ZixuanChen.vitest-explorer"  // Vitest
  ]
}
```

#### ワークスペース設定

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  },
  "eslint.workingDirectories": ["frontend"],
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### IntelliJ IDEA / WebStorm

- Biome プラグインをインストール
- ESLint を有効化
- Prettier を無効化（Biome と競合）
- TypeScript のバージョンをプロジェクトのものに設定

## Git フック（Lefthook）

プロジェクトは Lefthook を使用して pre-commit フックを自動実行します。

### インストール

```bash
# 初回のみ実行
pnpm lefthook:install
```

### 設定（lefthook.yml）

```yaml
pre-commit:
  parallel: true
  commands:
    frontend-lint:
      glob: "frontend/**/*.{ts,tsx}"
      run: cd frontend && pnpm lint --fix {staged_files}
    backend-lint:
      glob: "backend/**/*.ts"
      run: cd backend && pnpm biome:check:write {staged_files}
    frontend-typecheck:
      glob: "frontend/**/*.{ts,tsx}"
      run: cd frontend && pnpm build
    backend-typecheck:
      glob: "backend/**/*.ts"
      run: cd backend && pnpm typecheck
```

### フックのスキップ

```bash
# 緊急時のみ使用
git commit --no-verify
```

## CI/CD 環境

### GitHub Actions

pnpm workspace を使用しているため、ルートで一度インストールするだけで全パッケージの依存関係がインストールされます。

```yaml
# .github/workflows/ci.yml
name: CI

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      # ワークスペース全体の依存関係をインストール
      - run: pnpm install

      # 全パッケージでリント、型チェック、ビルド、テストを実行
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm build
      - run: pnpm test
```

## パフォーマンス最適化

### フロントエンド

- **Vite の高速ビルド**: HMR（Hot Module Replacement）による即座の反映
- **コード分割**: React.lazy と Suspense で必要な時にロード
- **SWR キャッシュ**: データフェッチングの最適化

### バックエンド

- **Hono の高速性**: 軽量で高速な Web フレームワーク
- **Prisma のクエリ最適化**: 効率的なデータベースアクセス
- **tsx watch**: TypeScript ファイルの変更を即座に反映

## セキュリティ

### 環境変数の管理

- `.env` ファイルは `.gitignore` に含める
- 本番環境では環境変数をサーバー設定で管理
- 機密情報はコードにハードコードしない

### 依存関係のセキュリティ

```bash
# セキュリティ監査
pnpm audit

# 脆弱性の修正
pnpm audit --fix
```

## その他の便利なコマンド

### プロジェクト全体のクリーンアップ

```bash
# すべての node_modules を削除
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# すべてのビルド成果物を削除
rm -rf frontend/dist backend/dist

# pnpm キャッシュクリア
pnpm store prune
```

### コード統計

```bash
# 行数カウント
cloc . --exclude-dir=node_modules,dist,coverage

# Git 統計
git log --oneline --graph --all
```
