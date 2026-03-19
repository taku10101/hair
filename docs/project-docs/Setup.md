# 開発環境セットアップガイド

このドキュメントでは、web_template プロジェクトの開発環境を構築する手順を説明します。

---

## 目次

1. [必須ツール](#必須ツール)
2. [プロジェクトのセットアップ](#プロジェクトのセットアップ)
3. [データベースのセットアップ](#データベースのセットアップ)
4. [オブジェクトストレージのセットアップ](#オブジェクトストレージのセットアップ)
5. [環境変数の設定](#環境変数の設定)
6. [開発サーバーの起動](#開発サーバーの起動)
7. [トラブルシューティング](#トラブルシューティング)

---

## 必須ツール

開発を始める前に、以下のツールをインストールしてください。

### 1. Node.js

**推奨バージョン**: Node.js 18.x 以上

```bash
# Nodeのバージョン確認
node --version

# プロジェクトでは .node-version ファイルで管理
cat .node-version
```

**インストール方法**:
- [公式サイト](https://nodejs.org/) からダウンロード
- または [nvm](https://github.com/nvm-sh/nvm) を使用

```bash
# nvmを使う場合
nvm install 18
nvm use 18
```

### 2. pnpm

**推奨バージョン**: pnpm 8.x 以上

```bash
# pnpmのインストール
npm install -g pnpm

# バージョン確認
pnpm --version
```

### 3. PostgreSQL

**推奨バージョン**: PostgreSQL 14.x 以上

**インストール方法**:
- **macOS**: `brew install postgresql@14`
- **Ubuntu**: `sudo apt install postgresql postgresql-contrib`
- **Windows**: [公式サイト](https://www.postgresql.org/download/windows/) からダウンロード

**起動方法**:
```bash
# macOS (Homebrew)
brew services start postgresql@14

# Ubuntu
sudo systemctl start postgresql
```

### 4. Docker & Docker Compose

MinIO（オブジェクトストレージ）を使用するために必要です。

**インストール方法**:
- [Docker Desktop](https://www.docker.com/products/docker-desktop) をダウンロード

**バージョン確認**:
```bash
docker --version
docker-compose --version
```

### 5. Git

```bash
git --version
```

---

## プロジェクトのセットアップ

### 1. リポジトリのクローン

```bash
# HTTPSでクローン
git clone https://github.com/your-org/web_template.git

# またはSSHでクローン
git clone git@github.com:your-org/web_template.git

# ディレクトリに移動
cd web_template
```

### 2. 依存関係のインストール

pnpm workspace を使用しているため、ルートで一度実行するだけで全パッケージの依存関係がインストールされます。

```bash
# ルートディレクトリで実行
pnpm install
```

これにより、以下のパッケージの依存関係が自動的にインストールされます：
- `frontend/` - React フロントエンド
- `backend/` - Hono バックエンド

---

## データベースのセットアップ

### 1. データベースの作成

```bash
# PostgreSQLに接続
psql -U postgres

# データベース作成
CREATE DATABASE web_template_dev;

# ユーザー作成（オプション）
CREATE USER web_template_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE web_template_dev TO web_template_user;

# 終了
\q
```

### 2. Prisma マイグレーション

```bash
# バックエンドディレクトリに移動
cd backend

# Prisma Client の生成
pnpm prisma:generate

# マイグレーション実行
pnpm prisma:migrate

# シードデータの投入（オプション）
pnpm prisma:seed
```

### 3. Prisma Studio（データベースGUI）

```bash
cd backend
pnpm prisma:studio
```

ブラウザで `http://localhost:5555` が開き、データベースの内容を確認できます。

---

## オブジェクトストレージのセットアップ

### MinIO の起動

MinIO は Docker Compose で管理されています。

```bash
# バックエンドディレクトリに移動
cd backend

# MinIOコンテナの起動
docker-compose up -d

# 起動確認
docker-compose ps
```

**MinIO Web UI**:
- URL: `http://localhost:9001`
- デフォルトログイン:
  - Username: `minioadmin`
  - Password: `minioadmin`

**バケットの作成**:
1. Web UIにログイン
2. 左サイドバーの「Buckets」をクリック
3. 「Create Bucket」をクリック
4. バケット名を入力（例: `uploads`）
5. 「Create」をクリック

---

## 環境変数の設定

### 1. バックエンドの環境変数

```bash
# バックエンドディレクトリに移動
cd backend

# .env.example をコピー
cp .env.example .env

# .env ファイルを編集
vi .env
```

**backend/.env の例**:
```env
# Database
DATABASE_URL="postgresql://web_template_user:your_password@localhost:5432/web_template_dev?schema=public"

# MinIO (S3互換オブジェクトストレージ)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=uploads
MINIO_USE_SSL=false

# JWT Secret
JWT_SECRET=your-secret-key-here

# Server Port
PORT=3088
```

### 2. フロントエンドの環境変数

```bash
# ルートディレクトリに戻る
cd ..

# .env.local.example をコピー（存在する場合）
cp .env.local.example .env.local

# または新規作成
vi .env.local
```

**.env.local の例**:
```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3088

# Firebase設定（認証を使用する場合）
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## 開発サーバーの起動

### オプション1: ワークスペース全体を起動（推奨）

ルートディレクトリから、フロントエンドとバックエンドを並行起動できます。

```bash
# ルートディレクトリで実行
pnpm dev
```

これにより以下が同時に起動します：
- フロントエンド: `http://localhost:5173`
- バックエンド: `http://localhost:3088`

### オプション2: 個別に起動

#### バックエンドの起動

```bash
cd backend
pnpm dev
```

バックエンドAPI: `http://localhost:3088`

#### フロントエンドの起動

```bash
cd frontend
pnpm dev
```

フロントエンド: `http://localhost:5173`

### 起動確認

1. **フロントエンド**: ブラウザで `http://localhost:5173` を開く
2. **バックエンドAPI**: `http://localhost:3088/api/health` にアクセス（ヘルスチェック）
3. **MinIO**: `http://localhost:9001` でWeb UIにアクセス

---

## 追加の開発ツール

### 1. Lefthook（Git Hooks）

プロジェクトは Lefthook を使用してコミット前のチェックを自動化しています。

```bash
# Lefthookのインストール（初回のみ）
pnpm dlx lefthook install

# フックの確認
lefthook run pre-commit
```

### 2. ESLint & Biome

**フロントエンド（ESLint）**:
```bash
cd frontend
pnpm lint
pnpm lint --fix
```

**バックエンド（Biome）**:
```bash
cd backend
pnpm lint
pnpm format
```

### 3. 型チェック

```bash
# ルートから全パッケージで型チェック
pnpm typecheck

# または個別に
cd frontend && pnpm build  # ビルド時に型チェック
cd backend && pnpm typecheck
```

### 4. テスト実行

```bash
# ルートから全パッケージでテスト実行
pnpm test

# または個別に
cd frontend && pnpm test
cd backend && pnpm test
```

---

## トラブルシューティング

### 問題1: `pnpm install` が失敗する

**原因**: Node.js のバージョンが古い、またはネットワークの問題

**解決策**:
```bash
# Node.jsのバージョン確認
node --version

# pnpmのキャッシュクリア
pnpm store prune

# 再インストール
rm -rf node_modules frontend/node_modules backend/node_modules
pnpm install
```

### 問題2: データベース接続エラー

**原因**: PostgreSQLが起動していない、または環境変数が間違っている

**解決策**:
```bash
# PostgreSQLの起動確認
pg_isready

# PostgreSQLの起動
brew services start postgresql@14  # macOS

# 環境変数の確認
cd backend
cat .env | grep DATABASE_URL
```

### 問題3: Prisma マイグレーションエラー

**原因**: データベースが存在しない、またはスキーマが壊れている

**解決策**:
```bash
cd backend

# データベースをリセット
pnpm prisma:reset

# 再マイグレーション
pnpm prisma:migrate
```

### 問題4: MinIOコンテナが起動しない

**原因**: Dockerが起動していない、またはポートが使用中

**解決策**:
```bash
# Dockerの起動確認
docker ps

# ポートの確認
lsof -i :9000
lsof -i :9001

# コンテナの再起動
cd backend
docker-compose down
docker-compose up -d
```

### 問題5: フロントエンドがバックエンドに接続できない

**原因**: 環境変数が正しく設定されていない

**解決策**:
```bash
# ルートディレクトリで.env.localを確認
cat .env.local

# VITE_API_BASE_URLが正しいか確認
# 正しい例: VITE_API_BASE_URL=http://localhost:3088

# 開発サーバーを再起動
cd frontend
pnpm dev
```

### 問題6: `nuqs` 関連のエラー

**原因**: `NuqsAdapter` がセットアップされていない

**解決策**:
`frontend/src/main.tsx` で `NuqsAdapter` がアプリをラップしているか確認してください。

```tsx
import { NuqsAdapter } from 'nuqs/adapters/react-router'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NuqsAdapter>
      <App />
    </NuqsAdapter>
  </React.StrictMode>,
)
```

---

## 次のステップ

環境構築が完了したら、以下のドキュメントを参照して開発を始めてください：

1. **アーキテクチャ設計書**: `/Users/hiramatsutakumi/IdeaProjects/work/try/web_template/.ai-guide/architecture.md`
2. **コーディング規約**: `/Users/hiramatsutakumi/IdeaProjects/work/try/web_template/.ai-guide/coding-rules.md`
3. **開発フロー**: `/Users/hiramatsutakumi/IdeaProjects/work/try/web_template/.ai-guide/workflow.md`
4. **テスト戦略**: `/Users/hiramatsutakumi/IdeaProjects/work/try/web_template/.ai-guide/testing.md`

---

## 参考リンク

- **プロジェクトREADME**: `/Users/hiramatsutakumi/IdeaProjects/work/try/web_template/README.md`
- **環境構築ガイド（AI Guide）**: `/Users/hiramatsutakumi/IdeaProjects/work/try/web_template/.ai-guide/environment.md`
- **データ取扱方針**: `/Users/hiramatsutakumi/IdeaProjects/work/try/web_template/.ai-guide/data-handling.md`
