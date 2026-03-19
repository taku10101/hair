# データベーススキーマ定義書

Web Template プロジェクトのデータベース構造とテーブル定義を記述します。

---

## 目次

1. [データベース概要](#データベース概要)
2. [ER図](#er図)
3. [テーブル定義](#テーブル定義)
   - [User](#user)
   - [File](#file)
4. [Enumeration型](#enumeration型)
5. [インデックス設計](#インデックス設計)
6. [マイグレーション管理](#マイグレーション管理)

---

## データベース概要

### 使用技術
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **スキーマ管理**: Prisma Migrate

### Prismaスキーマファイル
**場所**: [backend/prisma/schema.prisma](https://github.com/TLPropStation/web_template/blob/main/backend/prisma/schema.prisma)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  SALARY
}

model User {
  id        Int      @id @default(autoincrement())

  // Firebase authentication
  firebaseUid   String?  @unique

  // User information
  email         String   @unique
  name          String

  // Role management
  role          UserRole @default(SALARY)

  // Additional fields
  photoUrl      String?
  emailVerified Boolean  @default(false)
  lastSignInMethod String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model File {
  id           Int      @id @default(autoincrement())
  filename     String
  originalName String
  mimetype     String
  size         Int
  objectKey    String   @unique
  folder       String?
  uploadedAt   DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("files")
}
```

---

## ER図

```mermaid
erDiagram
    User {
        int id PK
        string firebaseUid UK "nullable"
        string email UK
        string name
        enum role
        string photoUrl "nullable"
        boolean emailVerified
        string lastSignInMethod "nullable"
        datetime createdAt
        datetime updatedAt
    }

    File {
        int id PK
        string filename
        string originalName
        string mimetype
        int size
        string objectKey UK
        string folder "nullable"
        datetime uploadedAt
        datetime updatedAt
    }
```

### リレーション
現在のスキーマでは、`User` と `File` の間に直接のリレーションはありません。
将来的にファイルアップロードとユーザーの関連付けが必要な場合は、`File` テーブルに `userId` フィールドを追加することを検討してください。

---

## テーブル定義

### User

ユーザー情報を管理するテーブル。Firebase Authentication と統合されています。

**テーブル名**: `users`

| カラム名 | データ型 | NULL許可 | デフォルト値 | 制約 | 説明 |
|---------|---------|---------|------------|-----|------|
| `id` | `INTEGER` | NO | `autoincrement()` | PRIMARY KEY | ユーザーID（自動採番） |
| `firebaseUid` | `TEXT` | YES | - | UNIQUE | Firebase Authentication UID |
| `email` | `TEXT` | NO | - | UNIQUE | メールアドレス（一意） |
| `name` | `TEXT` | NO | - | - | ユーザー名 |
| `role` | `UserRole` | NO | `'SALARY'` | - | ユーザーロール（ADMIN / SALARY） |
| `photoUrl` | `TEXT` | YES | - | - | プロフィール写真URL |
| `emailVerified` | `BOOLEAN` | NO | `false` | - | メール認証状態 |
| `lastSignInMethod` | `TEXT` | YES | - | - | 最後のサインイン方法 |
| `createdAt` | `TIMESTAMP` | NO | `now()` | - | 作成日時 |
| `updatedAt` | `TIMESTAMP` | NO | `now()` | - | 更新日時 |

#### インデックス
- **PRIMARY KEY**: `id`
- **UNIQUE**: `firebaseUid`
- **UNIQUE**: `email`

#### ビジネスルール
1. `email` は必須かつ一意である必要があります
2. `firebaseUid` は Firebase Authentication と同期時に設定されます（NULLの場合は招待ユーザー）
3. `role` のデフォルトは `SALARY`（一般ユーザー）です
4. `emailVerified` はメール認証の完了状態を示します
5. `createdAt` と `updatedAt` は自動管理されます

---

### File

アップロードされたファイルのメタデータを管理するテーブル。

**テーブル名**: `files`

| カラム名 | データ型 | NULL許可 | デフォルト値 | 制約 | 説明 |
|---------|---------|---------|------------|-----|------|
| `id` | `INTEGER` | NO | `autoincrement()` | PRIMARY KEY | ファイルID（自動採番） |
| `filename` | `TEXT` | NO | - | - | ファイル名（保存時の名前） |
| `originalName` | `TEXT` | NO | - | - | 元のファイル名 |
| `mimetype` | `TEXT` | NO | - | - | MIMEタイプ（例: image/png） |
| `size` | `INTEGER` | NO | - | - | ファイルサイズ（バイト） |
| `objectKey` | `TEXT` | NO | - | UNIQUE | MinIO/S3のオブジェクトキー（一意） |
| `folder` | `TEXT` | YES | - | - | フォルダ名（オプション） |
| `uploadedAt` | `TIMESTAMP` | NO | `now()` | - | アップロード日時 |
| `updatedAt` | `TIMESTAMP` | NO | `now()` | - | 更新日時 |

#### インデックス
- **PRIMARY KEY**: `id`
- **UNIQUE**: `objectKey`

#### ビジネスルール
1. `objectKey` はMinIO/S3ストレージ内のオブジェクトキーで一意である必要があります
2. `filename` はシステムが生成する保存時のファイル名です
3. `originalName` はユーザーがアップロードした元のファイル名です
4. `folder` はファイルの論理的なグループ化に使用します（オプション）
5. `uploadedAt` と `updatedAt` は自動管理されます

---

## Enumeration型

### UserRole

ユーザーのロール（権限レベル）を定義します。

| 値 | 説明 |
|----|------|
| `ADMIN` | 管理者：全ての操作が可能 |
| `SALARY` | 一般ユーザー：自身の情報のみ操作可能 |

#### 使用箇所
- `User.role` カラム

#### デフォルト値
- `SALARY`

---

## インデックス設計

### User テーブル

#### プライマリーキー
- `id` (PRIMARY KEY, AUTO_INCREMENT)

#### ユニークインデックス
- `firebaseUid` (UNIQUE) - Firebase認証UIDでの高速検索
- `email` (UNIQUE) - メールアドレスでの高速検索と重複防止

#### パフォーマンス最適化
- `firebaseUid` と `email` に UNIQUE 制約を設定することで、検索性能が向上します
- ログイン時の `firebaseUid` または `email` による検索が頻繁に行われるため、これらのフィールドにインデックスが必要です

### File テーブル

#### プライマリーキー
- `id` (PRIMARY KEY, AUTO_INCREMENT)

#### ユニークインデックス
- `objectKey` (UNIQUE) - MinIO/S3オブジェクトキーでの高速検索と重複防止

#### 追加検討事項
将来的に以下のインデックスを追加することを検討してください：
- `folder` - フォルダ別のファイル一覧取得の高速化
- `uploadedAt` - 日時順でのソートの高速化

---

## マイグレーション管理

### Prisma Migrateの使用

プロジェクトは Prisma Migrate を使用してデータベーススキーマのバージョン管理を行います。

#### マイグレーションファイルの場所
```
backend/prisma/migrations/
```

#### 主要なコマンド

##### 新しいマイグレーションを作成
```bash
cd backend
pnpm prisma:migrate
```

##### マイグレーションを適用
```bash
cd backend
npx prisma migrate deploy
```

##### Prisma Clientの生成
```bash
cd backend
pnpm prisma:generate
```

##### データベースをリセット（開発環境のみ）
```bash
cd backend
npx prisma migrate reset
```

##### Prisma Studioの起動（GUIでデータベースを確認）
```bash
cd backend
pnpm prisma:studio
```

### マイグレーション履歴

マイグレーション履歴は `backend/prisma/migrations/` ディレクトリに保存されています。

各マイグレーションには以下が含まれます：
- タイムスタンプ付きのディレクトリ名
- `migration.sql` - 実際のSQLスクリプト
- メタデータ

**GitHub**: [backend/prisma/migrations/](https://github.com/TLPropStation/web_template/tree/main/backend/prisma/migrations)

---

## データベース接続設定

### 環境変数

データベース接続URLは環境変数で管理されます。

**場所**: `backend/.env`

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

### 接続URL形式

```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=[schema]
```

**例**:
```
postgresql://web_template_user:mypassword@localhost:5432/web_template_dev?schema=public
```

---

## スキーマ変更時の手順

1. **Prismaスキーマファイルを編集**
   ```bash
   vi backend/prisma/schema.prisma
   ```

2. **マイグレーションファイルを生成**
   ```bash
   cd backend
   npx prisma migrate dev --name describe_your_change
   ```

3. **Prisma Clientを再生成**
   ```bash
   cd backend
   pnpm prisma:generate
   ```

4. **型定義の更新を確認**
   ```bash
   cd backend
   pnpm typecheck
   ```

5. **変更をコミット**
   ```bash
   git add backend/prisma/schema.prisma backend/prisma/migrations/
   git commit -m "feat: スキーマ変更の説明"
   ```

---

## セキュリティ考慮事項

### パスワード管理
- ユーザーのパスワードはデータベースに保存されません
- Firebase Authentication がパスワード管理を担当します
- `firebaseUid` を使用してFirebaseとデータベースのユーザーを紐付けます

### 個人情報の取り扱い
- `email` と `name` は個人情報として適切に管理する必要があります
- GDPR、個人情報保護法などの関連法規を遵守してください

### アクセス制御
- データベースアクセスは環境変数で管理された認証情報を使用します
- 本番環境では強力なパスワードを設定してください
- データベースへの直接アクセスは最小限に制限してください

---

## 関連ドキュメント

- **Prismaスキーマ**: [backend/prisma/schema.prisma](https://github.com/TLPropStation/web_template/blob/main/backend/prisma/schema.prisma)
- **OpenAPI仕様書**: [docs/project-docs/OpenAPI-Spec.md](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/OpenAPI-Spec.md)
- **アーキテクチャ設計書**: [.ai-guide/architecture.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/architecture.md)
- **環境構築ガイド**: [.ai-guide/environment.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/environment.md)
- **データ取扱方針**: [.ai-guide/data-handling.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/data-handling.md)

---

## 今後の拡張予定

以下のテーブル追加を検討中：

1. **UserFile リレーション**
   - `File` テーブルに `userId` フィールドを追加
   - ユーザーとファイルの所有関係を管理

2. **Session テーブル**
   - セッション管理が必要な場合

3. **AuditLog テーブル**
   - 監査ログの記録が必要な場合

4. **Invitation テーブル**
   - ユーザー招待の状態管理が必要な場合

これらの拡張は要件に応じて実装してください。
