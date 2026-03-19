# オブジェクトストレージガイド (MinIO)

## 概要

このプロジェクトでは、MinIOを使用したオブジェクトストレージ機能を提供しています。MinIOはS3互換のオープンソースオブジェクトストレージで、ファイルのアップロード、ダウンロード、管理を行います。

## アーキテクチャ

### レイヤー構造

```
presentation/
  └── controllers/storage.controller.ts     # HTTPリクエスト処理
  └── routes/storage.routes.ts              # ルート定義

domain/
  ├── entities/File.ts                       # Fileエンティティ
  ├── services/StorageService.ts            # ビジネスロジック
  ├── repositories/IStorageRepository.ts    # リポジトリインターフェース
  └── schemas/storage.schema.ts             # Zodスキーマとバリデーション

infrastructure/
  ├── storage/minio.ts                       # MinIOクライアント初期化
  └── repositories/StorageRepository.ts     # リポジトリ実装
```

### データフロー

```
Client Request
    ↓
Controller (storage.controller.ts)
    ↓
Service (StorageService.ts) ← ビジネスロジック・バリデーション
    ↓
Repository (StorageRepository.ts)
    ↓
MinIO + Prisma ← ファイル保存 + メタデータ保存
```

## 環境設定

### 環境変数

`backend/src/lib/env.ts:29-63`で定義されている環境変数:

```bash
# MinIOエンドポイント
MINIO_ENDPOINT=localhost

# MinIOポート番号
MINIO_PORT=9000

# MinIO認証情報
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# SSL使用フラグ
MINIO_USE_SSL=false

# バケット名
MINIO_BUCKET_NAME=web-template
```

### Docker構成

`backend/docker-compose.yml:17-35`でMinIOサービスを定義:

```yaml
services:
  minio:
    image: minio/minio:latest
    container_name: web_template_minio
    ports:
      - "9000:9000"   # API
      - "9001:9001"   # Web UI
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
```

## コア機能

### 1. MinIOクライアント初期化

`backend/src/infrastructure/storage/minio.ts`

**MinIOクライアントのシングルトンインスタンス:**

```typescript
export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});
```

**バケット初期化関数:**

```typescript
export async function initializeMinIOBucket(): Promise<void>
```

- バケットの存在確認
- 存在しない場合は自動作成
- アプリケーション起動時に実行

**ヘルスチェック関数:**

```typescript
export async function checkMinIOHealth(): Promise<boolean>
```

### 2. Fileエンティティ

`backend/src/domain/entities/File.ts`

**プロパティ:**

- `id`: ファイルID (自動採番)
- `filename`: 保存時のファイル名 (UUID付き)
- `originalName`: アップロード時の元のファイル名
- `mimetype`: MIMEタイプ
- `size`: ファイルサイズ (バイト)
- `objectKey`: MinIO内のオブジェクトキー
- `folder`: フォルダパス (オプション)
- `uploadedAt`: アップロード日時
- `updatedAt`: 更新日時

**主要メソッド:**

- `static fromPrisma()`: PrismaモデルからFileエンティティを生成
- `toJSON()`: JSONレスポンス形式に変換
- `isValidMimetype()`: MIMEタイプの検証
- `getFileExtension()`: ファイル拡張子を取得
- `getHumanReadableSize()`: 人間が読みやすいサイズ表記を取得

### 3. StorageService (ビジネスロジック)

`backend/src/domain/services/StorageService.ts`

**主要メソッド:**

#### uploadFile()
```typescript
async uploadFile(
  file: Buffer | Readable,
  originalName: string,
  mimetype: string,
  size: number,
  folder?: string
): Promise<File>
```

- MIMEタイプのバリデーション
- ファイルサイズのバリデーション
- ファイル名のサニタイゼーション
- StorageRepositoryを使ってアップロード実行

#### downloadFile()
```typescript
async downloadFile(id: number): Promise<{ stream: Readable; file: File }>
```

- ファイルメタデータの取得
- ファイルストリームの返却

#### deleteFile()
```typescript
async deleteFile(id: number): Promise<void>
```

- ファイル存在確認
- MinIOとデータベースから削除

#### listFiles()
```typescript
async listFiles(
  folder?: string,
  page = 1,
  limit = 20
): Promise<{ files: File[]; total: number; totalPages: number }>
```

- フォルダによるフィルタリング
- ページネーション対応
- 合計ページ数の計算

#### getFileMetadata()
```typescript
async getFileMetadata(id: number): Promise<File>
```

- ファイルメタデータの取得

### 4. StorageRepository (データアクセス)

`backend/src/infrastructure/repositories/StorageRepository.ts`

**依存関係:**

- `minioClient`: MinIOクライアント
- `prisma`: Prisma ORM クライアント

**主要メソッド:**

#### uploadFile()
`backend/src/infrastructure/repositories/StorageRepository.ts:25-62`

- オブジェクトキーの生成 (UUID + サニタイズされたファイル名)
- MinIOへのファイルアップロード
- Prismaへのメタデータ保存
- エラー時のロールバック処理

**セキュリティ対策:**
- ファイル名のサニタイゼーション (パストラバーサル対策)
- MIMEタイプの検証
- ファイルサイズの制限

#### downloadFile()
`backend/src/infrastructure/repositories/StorageRepository.ts:67-76`

- MinIOからファイルストリームを取得
- ストリーム形式で返却 (メモリ効率)

#### deleteFile()
`backend/src/infrastructure/repositories/StorageRepository.ts:81-93`

- MinIOからファイル削除
- Prismaからメタデータ削除
- トランザクション的な削除

#### listFiles()
`backend/src/infrastructure/repositories/StorageRepository.ts:98-121`

- フォルダによるフィルタリング
- ページネーション (skip/take)
- アップロード日時の降順でソート
- 合計件数も返却

**プライベートメソッド:**

- `generateObjectKey()`: UUID + ファイル名でユニークなキーを生成
- `sanitizeFilename()`: ファイル名のサニタイゼーション
- `extractFilename()`: オブジェクトキーからファイル名を抽出

### 5. バリデーションとスキーマ

`backend/src/domain/schemas/storage.schema.ts`

#### 許可されるMIMEタイプ

`backend/src/domain/schemas/storage.schema.ts:76-85`

```typescript
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/json",
  "text/plain",
  "text/csv",
] as const;
```

#### ファイルサイズ制限

`backend/src/domain/schemas/storage.schema.ts:90`

```typescript
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

#### Zodスキーマ

**UploadFileSchema**: アップロード時のバリデーション
**FileListQuerySchema**: 一覧取得時のクエリパラメータ
**FileResponseSchema**: レスポンス形式
**FileListResponseSchema**: 一覧レスポンス形式

## APIエンドポイント

### POST /storage/upload

ファイルをアップロード

**リクエスト:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: ファイル (必須)
  - `folder`: フォルダパス (オプション)

**レスポンス:**
```json
{
  "id": 1,
  "filename": "uuid-filename.jpg",
  "originalName": "photo.jpg",
  "mimetype": "image/jpeg",
  "size": 1024000,
  "folder": "uploads/photos",
  "uploadedAt": "2025-02-07T10:00:00.000Z",
  "updatedAt": "2025-02-07T10:00:00.000Z"
}
```

### GET /storage/download/:id

ファイルをダウンロード

**パラメータ:**
- `id`: ファイルID (必須)

**レスポンス:**
- ファイルストリーム
- Content-Type: ファイルのMIMEタイプ
- Content-Disposition: attachment

### GET /storage/files/:id

ファイル情報を取得

**パラメータ:**
- `id`: ファイルID (必須)

**レスポンス:**
```json
{
  "id": 1,
  "filename": "uuid-filename.jpg",
  "originalName": "photo.jpg",
  "mimetype": "image/jpeg",
  "size": 1024000,
  "folder": "uploads/photos",
  "uploadedAt": "2025-02-07T10:00:00.000Z",
  "updatedAt": "2025-02-07T10:00:00.000Z"
}
```

### GET /storage/files

ファイル一覧を取得

**クエリパラメータ:**
- `folder`: フォルダでフィルタリング (オプション)
- `page`: ページ番号 (デフォルト: 1)
- `limit`: 1ページあたりの件数 (デフォルト: 20, 最大: 100)

**レスポンス:**
```json
{
  "files": [
    {
      "id": 1,
      "filename": "uuid-filename.jpg",
      "originalName": "photo.jpg",
      "mimetype": "image/jpeg",
      "size": 1024000,
      "folder": "uploads/photos",
      "uploadedAt": "2025-02-07T10:00:00.000Z",
      "updatedAt": "2025-02-07T10:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### DELETE /storage/files/:id

ファイルを削除

**パラメータ:**
- `id`: ファイルID (必須)

**レスポンス:**
```json
{
  "message": "ファイルが正常に削除されました"
}
```

## セキュリティ対策

### 1. ファイル名のサニタイゼーション

`backend/src/infrastructure/repositories/StorageRepository.ts:159-164`

```typescript
private sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")  // 安全な文字のみ許可
    .replace(/\.{2,}/g, ".")            // 連続ドット除去
    .substring(0, 255);                 // 長さ制限
}
```

### 2. パストラバーサル対策

`backend/src/domain/services/StorageService.ts:124-137`

```typescript
private sanitizeOriginalName(originalName: string): string {
  // 制御文字と危険な文字を除去
  const sanitized = originalName.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");

  // パストラバーサル防止
  if (sanitized.includes("..")) {
    throw new Error("不正なファイル名です(パストラバーサル対策)");
  }

  return sanitized.substring(0, 255);
}
```

### 3. MIMEタイプの検証

`backend/src/domain/services/StorageService.ts:98-104`

- 許可されたMIMEタイプのホワイトリスト方式
- アップロード時に厳密にチェック

### 4. ファイルサイズの制限

`backend/src/domain/services/StorageService.ts:109-119`

- デフォルト10MBの上限
- 0バイト以下のファイルを拒否

### 5. ユニークなオブジェクトキー生成

`backend/src/infrastructure/repositories/StorageRepository.ts:148-154`

- UUID v4を使用して衝突を防止
- 元のファイル名を保持しつつセキュア

## 開発ガイド

### 新しいファイルタイプを追加する方法

1. `backend/src/domain/schemas/storage.schema.ts`の`ALLOWED_MIME_TYPES`に追加

```typescript
export const ALLOWED_MIME_TYPES = [
  // 既存のMIMEタイプ
  "video/mp4",  // 新規追加
] as const;
```

2. 必要に応じてファイルサイズ制限を調整

### カスタムバリデーションを追加する方法

`StorageService`の`validateMimetype()`や`validateFileSize()`をオーバーライドまたは拡張:

```typescript
// 例: 画像のみ許可するサービス
class ImageStorageService extends StorageService {
  protected override validateMimetype(mimetype: string): void {
    const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!imageMimeTypes.includes(mimetype)) {
      throw new Error("画像ファイルのみアップロード可能です");
    }
  }
}
```

### フォルダ構造の活用

フォルダ機能を使ってファイルを整理:

```typescript
// ユーザーごとのフォルダ
await storageService.uploadFile(
  fileBuffer,
  originalName,
  mimetype,
  size,
  `users/${userId}/avatars`
);

// プロジェクトごとのフォルダ
await storageService.uploadFile(
  fileBuffer,
  originalName,
  mimetype,
  size,
  `projects/${projectId}/documents`
);
```

### テストデータの準備

MinIO Web UIでバケットの確認・管理:

```
http://localhost:9001
```

ログイン情報:
- Username: `minioadmin`
- Password: `minioadmin`

## トラブルシューティング

### MinIO接続エラー

**症状:** アプリケーション起動時にMinIO接続エラー

**解決方法:**

1. Docker Composeでサービスが起動しているか確認:
```bash
cd backend
docker compose ps
```

2. MinIOコンテナのログを確認:
```bash
docker compose logs minio
```

3. ヘルスチェックを実行:
```bash
docker compose exec minio mc ready local
```

### バケットが作成されない

**症状:** アプリケーション起動時にバケット作成エラー

**解決方法:**

1. MinIO Web UIでバケットを手動作成
2. 環境変数`MINIO_BUCKET_NAME`が正しいか確認
3. MinIO認証情報が正しいか確認

### ファイルアップロードエラー

**症状:** ファイルアップロード時にエラー

**チェック項目:**

1. MIMEタイプが許可リストに含まれているか
2. ファイルサイズが上限を超えていないか
3. ファイル名に不正な文字が含まれていないか
4. MinIOへの接続が正常か

### メタデータとMinIOの不整合

**症状:** Prismaにメタデータはあるが、MinIOにファイルが存在しない

**原因:** アップロード中のエラーでロールバックが正常に行われなかった

**解決方法:**

1. 孤立したメタデータを手動削除
2. 該当ファイルIDを使って再アップロード試行

## ベストプラクティス

### 1. エラーハンドリング

すべてのストレージ操作でtry-catchを使用:

```typescript
try {
  const file = await storageService.uploadFile(/* ... */);
  return file;
} catch (error) {
  // ログ出力
  console.error("ファイルアップロードエラー:", error);
  // 適切なHTTPステータスコードを返す
  throw new Error("ファイルのアップロードに失敗しました");
}
```

### 2. ストリーム処理

大きなファイルはBufferではなくStreamで処理:

```typescript
// ストリームを使用
const stream = await storageRepository.downloadFile(objectKey);
return stream; // Streamとして返す
```

### 3. ファイル削除の前確認

ファイル削除前に必ず存在確認:

```typescript
const file = await storageRepository.getFileMetadata(id);
if (!file) {
  throw new Error("ファイルが見つかりません");
}
await storageRepository.deleteFile(file.objectKey);
```

### 4. ページネーションの活用

大量のファイルを扱う場合は必ずページネーションを使用:

```typescript
const result = await storageService.listFiles(
  folder,
  page,
  20  // 適切なlimit値
);
```

### 5. フォルダによる論理分割

アプリケーションの構造に合わせてフォルダを分割:

```
/users/{userId}/avatars/       # ユーザーアバター
/users/{userId}/documents/     # ユーザードキュメント
/projects/{projectId}/files/   # プロジェクトファイル
/public/images/                # 公開画像
```

## 関連ファイル

### 実装ファイル

- `backend/src/infrastructure/storage/minio.ts` - MinIOクライアント
- `backend/src/infrastructure/repositories/StorageRepository.ts` - リポジトリ実装
- `backend/src/domain/services/StorageService.ts` - ビジネスロジック
- `backend/src/domain/entities/File.ts` - Fileエンティティ
- `backend/src/domain/repositories/IStorageRepository.ts` - リポジトリインターフェース
- `backend/src/domain/schemas/storage.schema.ts` - スキーマ定義
- `backend/src/presentation/controllers/storage.controller.ts` - コントローラー
- `backend/src/presentation/routes/storage.routes.ts` - ルート定義

### 設定ファイル

- `backend/docker-compose.yml` - MinIOコンテナ設定
- `backend/src/lib/env.ts` - 環境変数定義
- `backend/prisma/schema.prisma` - Fileモデル定義

## 今後の拡張案

### 1. 画像リサイズ機能

アップロード時にサムネイル自動生成:

```typescript
// Sharp等の画像処理ライブラリを使用
import sharp from 'sharp';

async uploadImageWithThumbnail(/* ... */) {
  const thumbnail = await sharp(buffer)
    .resize(200, 200)
    .toBuffer();

  // オリジナルとサムネイルを両方保存
}
```

### 2. 署名付きURL生成

一時的なダウンロードリンク生成:

```typescript
async getPresignedUrl(objectKey: string, expirySeconds = 3600): Promise<string> {
  return await this.minioClient.presignedGetObject(
    env.MINIO_BUCKET_NAME,
    objectKey,
    expirySeconds
  );
}
```

### 3. ファイルバージョニング

同一ファイルの複数バージョン管理:

```typescript
interface FileVersion {
  fileId: number;
  version: number;
  objectKey: string;
  createdAt: Date;
}
```

### 4. アクセス制御

ユーザーごとのファイルアクセス権限管理:

```typescript
interface FilePermission {
  fileId: number;
  userId: number;
  permission: 'read' | 'write' | 'delete';
}
```

### 5. ウイルススキャン

アップロード時のウイルスチェック:

```typescript
async uploadFile(/* ... */) {
  // ClamAV等を使用してスキャン
  const scanResult = await virusScanner.scan(file);
  if (!scanResult.clean) {
    throw new Error("ウイルスが検出されました");
  }
  // 続きの処理
}
```
