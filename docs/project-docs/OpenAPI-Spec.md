# OpenAPI 3.0 API仕様書

Web Template プロジェクトのAPI仕様書です。全てのエンドポイントは Hono + Zod OpenAPI で実装されています。

---

## 目次

1. [API概要](#api概要)
2. [認証方式](#認証方式)
3. [ベースURL](#ベースurl)
4. [エンドポイント一覧](#エンドポイント一覧)
   - [Authentication](#authentication)
   - [Users](#users)
   - [Storage](#storage)
5. [共通レスポンス](#共通レスポンス)
6. [エラーハンドリング](#エラーハンドリング)

---

## API概要

### 技術スタック
- **フレームワーク**: Hono
- **バリデーション**: Zod
- **API仕様**: Zod OpenAPI
- **認証**: Firebase Authentication (JWT Bearer Token)
- **データベース**: PostgreSQL + Prisma ORM

### API設計原則
- RESTful API
- JSON形式のリクエスト/レスポンス
- ステータスコードによるレスポンス管理
- Zodスキーマによる厳密な型バリデーション

---

## 認証方式

### 認証方法
Firebase Authentication による JWT Bearer Token 認証を使用しています。

### 認証ヘッダー
```http
Authorization: Bearer <firebase_id_token>
```

### 認証が必要なエンドポイント
- `POST /auth/sync` - ユーザー同期
- `GET /auth/me` - 現在のユーザー情報取得
- `POST /auth/invite` - ユーザー招待（管理者のみ）
- `PATCH /auth/profile` - プロフィール更新
- `POST /auth/change-password` - パスワード変更
- `GET /users/*` - ユーザー管理（管理者のみ）
- `POST /users/*` - ユーザー作成（管理者のみ）
- `PATCH /users/*` - ユーザー更新（管理者のみ）
- `DELETE /users/*` - ユーザー削除（管理者のみ）
- `/storage/*` - ストレージ操作

### ユーザーロール
- **ADMIN**: 管理者権限（全ての操作が可能）
- **SALARY**: 一般ユーザー権限（自身の情報のみ操作可能）

---

## ベースURL

### 開発環境
```
http://localhost:3088
```

### 本番環境
```
https://api.example.com
```

---

## エンドポイント一覧

## Authentication

認証・認可関連のエンドポイント

**実装ファイル**:
- ルート定義: [backend/src/routes/authRoutes.ts](https://github.com/TLPropStation/web_template/blob/main/backend/src/routes/authRoutes.ts)
- コントローラー: [backend/src/controllers/authController.ts](https://github.com/TLPropStation/web_template/blob/main/backend/src/controllers/authController.ts)
- スキーマ: [backend/src/schemas/authSchema.ts](https://github.com/TLPropStation/web_template/blob/main/backend/src/schemas/authSchema.ts)

### 1. POST /auth/signup
ユーザー登録

**リクエスト**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**レスポンス**: 201 Created
```json
{
  "user": {
    "id": 1,
    "firebaseUid": "firebase-uid-xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "photoUrl": null,
    "emailVerified": false,
    "lastSignInMethod": "email",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**エラーレスポンス**:
- `400 Bad Request`: バリデーションエラー
- `500 Internal Server Error`: サーバーエラー

---

### 2. POST /auth/login
ユーザーログイン

**リクエスト**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス**: 200 OK
```json
{
  "message": "Login information received"
}
```

**エラーレスポンス**:
- `400 Bad Request`: 無効な認証情報
- `500 Internal Server Error`: サーバーエラー

---

### 3. POST /auth/sync
Firebase認証ユーザーとデータベースを同期

**認証**: 必要（Bearer Token）

**リクエスト**:
```json
{
  "name": "John Doe"
}
```

**レスポンス**: 201 Created
```json
{
  "user": {
    "id": 1,
    "firebaseUid": "firebase-uid-xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "photoUrl": null,
    "emailVerified": false,
    "lastSignInMethod": "google.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**エラーレスポンス**:
- `400 Bad Request`: バリデーションエラー
- `401 Unauthorized`: 認証エラー
- `500 Internal Server Error`: サーバーエラー

---

### 4. GET /auth/me
現在のユーザー情報を取得

**認証**: 必要（Bearer Token）

**レスポンス**: 200 OK
```json
{
  "user": {
    "id": 1,
    "firebaseUid": "firebase-uid-xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "photoUrl": "https://example.com/photo.jpg",
    "emailVerified": true,
    "lastSignInMethod": "google.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**エラーレスポンス**:
- `401 Unauthorized`: 認証エラー
- `500 Internal Server Error`: サーバーエラー

---

### 5. POST /auth/invite
新規ユーザーを招待（管理者のみ）

**認証**: 必要（Bearer Token + ADMIN権限）

**リクエスト**:
```json
{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "password": "password123",
  "role": "SALARY"
}
```

**レスポンス**: 201 Created
```json
{
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "name": "Jane Smith",
    "role": "SALARY",
    "emailVerified": false
  },
  "message": "User invited successfully"
}
```

**エラーレスポンス**:
- `400 Bad Request`: バリデーションエラー
- `401 Unauthorized`: 認証エラー
- `403 Forbidden`: 管理者権限がない
- `500 Internal Server Error`: サーバーエラー

---

### 6. PATCH /auth/profile
プロフィール更新

**認証**: 必要（Bearer Token）

**リクエスト**:
```json
{
  "name": "John Updated",
  "photoUrl": "https://example.com/new-photo.jpg"
}
```

**レスポンス**: 200 OK
```json
{
  "user": {
    "id": 1,
    "firebaseUid": "firebase-uid-xxx",
    "email": "user@example.com",
    "name": "John Updated",
    "photoUrl": "https://example.com/new-photo.jpg",
    "emailVerified": true,
    "lastSignInMethod": "google.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

**エラーレスポンス**:
- `400 Bad Request`: バリデーションエラー
- `401 Unauthorized`: 認証エラー
- `500 Internal Server Error`: サーバーエラー

---

### 7. POST /auth/change-password
パスワード変更

**認証**: 必要（Bearer Token）

**リクエスト**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**レスポンス**: 200 OK
```json
{
  "message": "Password changed successfully"
}
```

**エラーレスポンス**:
- `400 Bad Request`: 現在のパスワードが間違っている
- `401 Unauthorized`: 認証エラー
- `500 Internal Server Error`: サーバーエラー

---

## Users

ユーザー管理エンドポイント（管理者のみアクセス可能）

**実装ファイル**:
- ルート定義: [backend/src/routes/userRoutes.ts](https://github.com/TLPropStation/web_template/blob/main/backend/src/routes/userRoutes.ts)
- コントローラー: [backend/src/controllers/userController.ts](https://github.com/TLPropStation/web_template/blob/main/backend/src/controllers/userController.ts)
- スキーマ: [backend/src/schemas/userSchema.ts](https://github.com/TLPropStation/web_template/blob/main/backend/src/schemas/userSchema.ts)

### 8. GET /users
全ユーザーを取得

**認証**: 必要（Bearer Token + ADMIN権限）

**レスポンス**: 200 OK
```json
[
  {
    "id": 1,
    "firebaseUid": "firebase-uid-xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "photoUrl": "https://example.com/photo.jpg",
    "emailVerified": true,
    "lastSignInMethod": "google.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**エラーレスポンス**:
- `401 Unauthorized`: 認証エラー
- `403 Forbidden`: 管理者権限がない
- `500 Internal Server Error`: サーバーエラー

---

### 9. GET /users/{id}
特定のユーザーを取得

**認証**: 必要（Bearer Token + ADMIN権限）

**パスパラメータ**:
- `id`: ユーザーID（整数）

**レスポンス**: 200 OK
```json
{
  "id": 1,
  "firebaseUid": "firebase-uid-xxx",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "SALARY",
  "photoUrl": "https://example.com/photo.jpg",
  "emailVerified": true,
  "lastSignInMethod": "email",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**エラーレスポンス**:
- `400 Bad Request`: 無効なユーザーID
- `404 Not Found`: ユーザーが見つからない
- `401 Unauthorized`: 認証エラー
- `403 Forbidden`: 管理者権限がない
- `500 Internal Server Error`: サーバーエラー

---

### 10. POST /users
新規ユーザーを作成

**認証**: 必要（Bearer Token + ADMIN権限）

**リクエスト**:
```json
{
  "firebaseUid": "firebase-uid-xxx",
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "role": "SALARY",
  "photoUrl": "https://example.com/photo.jpg",
  "emailVerified": false,
  "lastSignInMethod": "email"
}
```

**レスポンス**: 201 Created
```json
{
  "id": 2,
  "firebaseUid": "firebase-uid-xxx",
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "role": "SALARY",
  "photoUrl": "https://example.com/photo.jpg",
  "emailVerified": false,
  "lastSignInMethod": "email",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**エラーレスポンス**:
- `400 Bad Request`: バリデーションエラー
- `401 Unauthorized`: 認証エラー
- `403 Forbidden`: 管理者権限がない
- `500 Internal Server Error`: サーバーエラー

---

### 11. PATCH /users/{id}
ユーザー情報を更新

**認証**: 必要（Bearer Token + ADMIN権限）

**パスパラメータ**:
- `id`: ユーザーID（整数）

**リクエスト**:
```json
{
  "name": "John Updated",
  "role": "ADMIN",
  "photoUrl": "https://example.com/new-photo.jpg"
}
```

**レスポンス**: 200 OK
```json
{
  "id": 1,
  "firebaseUid": "firebase-uid-xxx",
  "email": "user@example.com",
  "name": "John Updated",
  "role": "ADMIN",
  "photoUrl": "https://example.com/new-photo.jpg",
  "emailVerified": true,
  "lastSignInMethod": "email",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

**エラーレスポンス**:
- `400 Bad Request`: バリデーションエラー
- `404 Not Found`: ユーザーが見つからない
- `401 Unauthorized`: 認証エラー
- `403 Forbidden`: 管理者権限がない
- `500 Internal Server Error`: サーバーエラー

---

### 12. DELETE /users/{id}
ユーザーを削除

**認証**: 必要（Bearer Token + ADMIN権限）

**パスパラメータ**:
- `id`: ユーザーID（整数）

**レスポンス**: 200 OK
```json
{
  "id": 1,
  "firebaseUid": "firebase-uid-xxx",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "SALARY",
  "photoUrl": "https://example.com/photo.jpg",
  "emailVerified": true,
  "lastSignInMethod": "email",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**エラーレスポンス**:
- `400 Bad Request`: 無効なユーザーID
- `404 Not Found`: ユーザーが見つからない
- `401 Unauthorized`: 認証エラー
- `403 Forbidden`: 管理者権限がない
- `500 Internal Server Error`: サーバーエラー

---

## Storage

ファイルストレージ管理エンドポイント（MinIO S3互換）

**実装ファイル**:
- ルート定義: [backend/src/routes/storageRoutes.ts](https://github.com/TLPropStation/web_template/blob/main/backend/src/routes/storageRoutes.ts)
- コントローラー: [backend/src/controllers/storageController.ts](https://github.com/TLPropStation/web_template/blob/main/backend/src/controllers/storageController.ts)
- スキーマ: [backend/src/schemas/storageSchema.ts](https://github.com/TLPropStation/web_template/blob/main/backend/src/schemas/storageSchema.ts)

### 13. POST /storage/upload
ファイルをアップロード

**認証**: 必要（Bearer Token）

**リクエスト**: `multipart/form-data`
```
file: <binary>
folder: "uploads" (optional)
```

**レスポンス**: 201 Created
```json
{
  "id": "file-uuid-xxx",
  "filename": "example.pdf",
  "mimetype": "application/pdf",
  "size": 1024000,
  "url": "https://minio.example.com/uploads/file-uuid-xxx.pdf",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**エラーレスポンス**:
- `400 Bad Request`: ファイルが無効、またはファイルタイプが許可されていない
- `401 Unauthorized`: 認証エラー
- `500 Internal Server Error`: サーバーエラー

---

### 14. GET /storage/download/{id}
ファイルをダウンロード

**認証**: 必要（Bearer Token）

**パスパラメータ**:
- `id`: ファイルID（UUID）

**レスポンス**: 200 OK
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="example.pdf"

<binary data>
```

**エラーレスポンス**:
- `400 Bad Request`: 無効なファイルID
- `404 Not Found`: ファイルが見つからない
- `401 Unauthorized`: 認証エラー
- `500 Internal Server Error`: サーバーエラー

---

### 15. GET /storage/files/{id}
ファイル情報を取得

**認証**: 必要（Bearer Token）

**パスパラメータ**:
- `id`: ファイルID（UUID）

**レスポンス**: 200 OK
```json
{
  "id": "file-uuid-xxx",
  "filename": "example.pdf",
  "mimetype": "application/pdf",
  "size": 1024000,
  "url": "https://minio.example.com/uploads/file-uuid-xxx.pdf",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**エラーレスポンス**:
- `400 Bad Request`: 無効なファイルID
- `404 Not Found`: ファイルが見つからない
- `401 Unauthorized`: 認証エラー
- `500 Internal Server Error`: サーバーエラー

---

### 16. GET /storage/files
ファイル一覧を取得

**認証**: 必要（Bearer Token）

**クエリパラメータ**:
- `folder`: フォルダ名（オプション）
- `page`: ページ番号（オプション、デフォルト: 1）
- `limit`: 1ページあたりの件数（オプション、デフォルト: 20）

**レスポンス**: 200 OK
```json
{
  "files": [
    {
      "id": "file-uuid-xxx",
      "filename": "example.pdf",
      "mimetype": "application/pdf",
      "size": 1024000,
      "url": "https://minio.example.com/uploads/file-uuid-xxx.pdf",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

**エラーレスポンス**:
- `401 Unauthorized`: 認証エラー
- `500 Internal Server Error`: サーバーエラー

---

### 17. DELETE /storage/files/{id}
ファイルを削除

**認証**: 必要（Bearer Token）

**パスパラメータ**:
- `id`: ファイルID（UUID）

**レスポンス**: 200 OK
```json
{
  "message": "File deleted successfully"
}
```

**エラーレスポンス**:
- `400 Bad Request`: 無効なファイルID
- `404 Not Found`: ファイルが見つからない
- `401 Unauthorized`: 認証エラー
- `500 Internal Server Error`: サーバーエラー

---

## 共通レスポンス

### 成功レスポンス

| ステータスコード | 説明 |
|---|---|
| 200 OK | リクエスト成功 |
| 201 Created | リソース作成成功 |

### エラーレスポンス

| ステータスコード | 説明 |
|---|---|
| 400 Bad Request | リクエストが無効（バリデーションエラー） |
| 401 Unauthorized | 認証エラー（トークンが無効または期限切れ） |
| 403 Forbidden | 権限エラー（アクセス権限がない） |
| 404 Not Found | リソースが見つからない |
| 500 Internal Server Error | サーバー内部エラー |

---

## エラーハンドリング

### エラーレスポンス形式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### エラーコード一覧

| コード | 説明 |
|---|---|
| `VALIDATION_ERROR` | バリデーションエラー |
| `AUTHENTICATION_ERROR` | 認証エラー |
| `AUTHORIZATION_ERROR` | 認可エラー |
| `NOT_FOUND` | リソースが見つからない |
| `INTERNAL_ERROR` | サーバー内部エラー |

---

## 関連ドキュメント

- **Prismaスキーマ**: [backend/generated/prisma/schema.prisma](https://github.com/TLPropStation/web_template/blob/main/backend/generated/prisma/schema.prisma)
- **アーキテクチャ設計書**: [.ai-guide/architecture.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/architecture.md)
- **認証・認可システム**: [.ai-guide/authentication.md](https://github.com/TLPropStation/web_template/blob/main/.ai-guide/authentication.md)
- **データベーススキーマ**: [docs/project-docs/Database-Schema.md](https://github.com/TLPropStation/web_template/blob/main/docs/project-docs/Database-Schema.md)

---

## OpenAPI仕様書の取得

### Swagger UI（推奨）

バックエンドサーバーを起動すると、Swagger UIでインタラクティブなAPI仕様書を閲覧できます。

**開発環境**:
```
http://localhost:3088/api/ui
```

### OpenAPI JSON 仕様書

プログラムから仕様書を取得する場合は、以下のエンドポイントにアクセスしてください。

**開発環境**:
```
http://localhost:3088/api/doc
```

### バックエンドサーバーの起動

```bash
# バックエンドディレクトリに移動
cd backend

# 開発サーバーを起動
pnpm dev
```

サーバーが起動したら、ブラウザで `http://localhost:3088/api/ui` にアクセスすると、Swagger UIが表示されます。

### 実装ファイル

OpenAPIドキュメントの設定は以下のファイルで行われています：

**エントリポイント**: [backend/src/index.ts](https://github.com/TLPropStation/web_template/blob/main/backend/src/index.ts)

```typescript
// OpenAPIドキュメント
app.doc("/api/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Backend API",
  },
});

// Swagger UIドキュメント
app.get("/api/ui", swaggerUI({ url: "/api/doc" }));
```
