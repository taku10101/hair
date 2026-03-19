# 認証・認可システム

このドキュメントでは、プロジェクトの認証・認可システムのアーキテクチャと実装方法について説明します。

## 概要

本プロジェクトは **Firebase Authentication** を使用した認証システムを採用しています。Firebase認証とバックエンドデータベース（PostgreSQL）を連携させることで、柔軟で拡張性の高い認証システムを実現しています。

## アーキテクチャ

### 認証フロー

```
ユーザー（ブラウザ）
    ↓
Firebase Authentication (クライアント側)
    ↓ ID Token
バックエンドAPI (認証ミドルウェア)
    ↓ Firebase UID
データベース (ユーザー情報)
```

### 主要コンポーネント

#### 1. フロントエンド

**認証コンテキスト** (`frontend/src/contexts/AuthContext.tsx`)
- Firebase認証状態の管理
- ログイン・サインアップ・ログアウト機能
- ユーザー情報の取得と更新

**認証フック** (`frontend/src/hooks/auth/`)
- `useAuth`: 認証状態とメソッドを提供
- `useRequireAuth`: 認証が必要なページで使用
- `useFetchUserData`: バックエンドからユーザーデータを取得

**保護ルート** (`frontend/src/components/auth/`)
- `ProtectedRoute`: 認証が必要なルート
- `AdminProtectedRoute`: 管理者権限が必要なルート

#### 2. バックエンド

**認証ミドルウェア** (`backend/src/middlewares/authMiddleware.ts`)
- Firebase ID Tokenの検証
- ユーザー情報をコンテキストに設定

**ロールミドルウェア** (`backend/src/middlewares/roleMiddleware.ts`)
- ユーザーロールの検証
- 管理者権限チェック

**認証サービス** (`backend/src/services/authService.ts`)
- ユーザー作成とFirebase UID同期
- プロフィール更新
- パスワード変更

## 実装されている機能

### 1. ユーザー登録（サインアップ）

```typescript
// フロントエンド
const { signUp } = useAuth();
await signUp(email, password);

// バックエンド
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "name": "ユーザー名"
}
```

**フロー:**
1. フロントエンドでFirebase認証を使用してユーザー作成
2. バックエンドAPIを呼び出してデータベースにユーザー情報を保存
3. Firebase UIDとデータベースのユーザーIDを紐付け

### 2. ログイン

```typescript
// フロントエンド
const { signIn } = useAuth();
await signIn(email, password);

// バックエンド（任意）
POST /api/auth/login
```

**フロー:**
1. Firebase認証でログイン
2. ID Tokenを取得
3. 以降のAPIリクエストにID Tokenを付与

### 3. ユーザー同期

```typescript
POST /api/auth/sync
Authorization: Bearer <ID_TOKEN>
{
  "name": "ユーザー名"
}
```

**目的:**
- Firebase認証済みユーザーをデータベースに同期
- 新規ログイン時にユーザー情報を作成または更新

### 4. プロフィール管理

#### プロフィール取得
```typescript
GET /api/auth/me
Authorization: Bearer <ID_TOKEN>
```

#### プロフィール更新
```typescript
PATCH /api/auth/profile
Authorization: Bearer <ID_TOKEN>
{
  "name": "新しい名前",
  "photoUrl": "https://example.com/photo.jpg"
}
```

**フロー:**
1. バックエンドAPIでプロフィール更新
2. Firebase Admin SDKでFirebaseユーザー情報も更新
3. データベースのユーザー情報を更新

### 5. パスワード変更

```typescript
POST /api/auth/change-password
Authorization: Bearer <ID_TOKEN>
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

**フロー:**
1. フロントエンドで現在のパスワードで再認証
2. Firebase Auth APIでパスワード更新
3. バックエンドに変更を通知（オプション）

### 6. 管理者によるユーザー招待

```typescript
POST /api/auth/invite
Authorization: Bearer <ID_TOKEN>
X-User-Role: ADMIN
{
  "email": "newuser@example.com",
  "name": "新規ユーザー",
  "password": "initialPassword123",
  "role": "SALARY"
}
```

**フロー:**
1. 管理者が新規ユーザーのメールアドレス、名前、初期パスワードを入力
2. バックエンドでFirebaseユーザーを作成（管理者が指定したパスワードを使用）
3. データベースにユーザー情報を保存
4. 招待されたユーザーは、管理者から教えてもらったメールアドレスとパスワードでログイン可能

## ユーザーロール

### ロール定義

```prisma
enum UserRole {
  ADMIN   // 管理者: すべての操作が可能
  SALARY  // 一般ユーザー: 限定的な操作のみ
}
```

### ロールチェック

**バックエンド:**
```typescript
// 管理者のみアクセス可能
app.use("/admin/*", authMiddleware);
app.use("/admin/*", requireAdmin);
```

**フロントエンド:**
```typescript
// 管理者専用ルート
<Route element={<AdminProtectedRoute />}>
  <Route path="/admin/users" element={<AdminUsersPage />} />
</Route>
```

## セキュリティ考慮事項

### 1. トークンの管理

- **ID Token**: Firebase認証後に取得し、すべてのAPIリクエストに付与
- **自動更新**: Firebase SDKがトークンの有効期限を自動管理
- **HTTPSのみ**: 本番環境ではHTTPS通信必須

### 2. パスワードポリシー

- **最小長**: 8文字以上
- **複雑性**: Firebase側で管理（推奨: 大文字・小文字・数字・記号の組み合わせ）
- **変更時の再認証**: パスワード変更時は現在のパスワードで再認証必須

### 3. 認証ミドルウェア

```typescript
// すべての保護されたエンドポイントで認証を要求
app.use("/api/users/*", authMiddleware);
app.use("/api/admin/*", authMiddleware);
app.use("/api/admin/*", requireAdmin);
```

### 4. CORS設定

```typescript
// 許可するオリジンを制限
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

## データモデル

### User テーブル

```prisma
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
```

**フィールド説明:**
- `firebaseUid`: Firebase認証のユーザーID（Firebaseとの紐付け）
- `email`: メールアドレス（ユニーク）
- `name`: 表示名
- `role`: ユーザーロール（ADMIN / SALARY）
- `photoUrl`: プロフィール画像URL
- `emailVerified`: メール確認済みフラグ
- `lastSignInMethod`: 最後のサインイン方法（email、google など）

## エラーハンドリング

### 認証エラー

```typescript
// 401 Unauthorized
{
  "error": "Unauthorized"
}

// 403 Forbidden
{
  "error": "Forbidden - Admin role required"
}
```

### バリデーションエラー

```typescript
// 400 Bad Request
{
  "error": "Email already exists"
}
```

## 環境変数

### フロントエンド (.env)

```bash
# Firebase設定
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# API URL
VITE_API_BASE_URL=http://localhost:3346
```

### バックエンド (.env)

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## テスト

### 認証フローのテスト

```typescript
describe('Authentication', () => {
  it('should signup a new user', async () => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.user.email).toBe('test@example.com');
  });
});
```

## 将来の拡張計画

### 1. ユーザー招待時の自動メール送信 【将来実装】

**現状:**
- 管理者がユーザー招待時に初期パスワードを設定
- 招待されたユーザーには、管理者から直接メールアドレスとパスワードを伝える運用

**将来の実装（Firebase Extensions使用）:**

Firebase Extensionsの「Trigger Email」を使用して、招待メールを自動送信する機能を実装予定：

```typescript
// ユーザー招待メール（招待リンク方式に変更）
await sendEmail({
  to: newUser.email,
  template: 'user-invitation',
  data: {
    name: newUser.name,
    invitationLink: inviteLink, // 初回パスワード設定用のリンク
    invitedBy: currentUser.name,
  },
});
```

**実装するメールテンプレート:**
1. **ユーザー招待メール**: 初回パスワード設定リンク付き（現在は管理者が直接パスワードを設定）
2. **パスワードリセットメール**: パスワード再設定リンク
3. **メール確認メール**: メールアドレス確認リンク
4. **ログイン通知メール**: 新しいデバイスからのログイン通知

**メリット:**
- カスタマイズ可能なHTMLメールテンプレート
- Firebase Authenticationとのネイティブ統合
- メール配信の追跡とログ
- SendGrid、Mailgunなど複数のメールプロバイダーに対応
- セキュリティ向上（管理者が初期パスワードを知る必要がない）

**コスト:**
- Firebase Extensionsは有料機能
- メール送信数に応じた従量課金
- 現時点ではスコープ外（将来の検討事項）

**実装時の参考:**
- [Firebase Extensions - Trigger Email](https://extensions.dev/extensions/firebase/firestore-send-email)
- メールテンプレートをFirestoreに保存
- Cloud Functionsでメール送信をトリガー

### 2. ソーシャルログイン

**実装予定のプロバイダー:**
- Google
- GitHub
- Microsoft

**実装方針:**
```typescript
// Googleログイン
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
```

### 3. 多要素認証（MFA）

Firebase Authenticationの多要素認証機能を使用:
- SMS認証
- TOTPアプリ（Google Authenticator等）

### 4. セッション管理

- アクティブセッション一覧
- 特定デバイスからのログアウト
- 全デバイスからのログアウト

### 5. 監査ログ

```typescript
model AuditLog {
  id        Int      @id @default(autoincrement())
  userId    Int
  action    String   // LOGIN, LOGOUT, PASSWORD_CHANGE, etc.
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}
```

## ベストプラクティス

### 1. トークンの安全な保存

- **推奨**: Firebase SDKのデフォルト（IndexedDB）を使用
- **非推奨**: localStorageへの直接保存

### 2. 認証状態の監視

```typescript
// AuthContextで自動的に監視
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setCurrentUser(user);
    // ユーザー情報の取得
  });
  return unsubscribe;
}, []);
```

### 3. エラー処理

```typescript
try {
  await signIn(email, password);
} catch (error) {
  if (error.code === 'auth/user-not-found') {
    // ユーザーが見つからない
  } else if (error.code === 'auth/wrong-password') {
    // パスワードが間違っている
  }
}
```

### 4. パスワード変更時の再認証

```typescript
// 必ず現在のパスワードで再認証
const credential = EmailAuthProvider.credential(email, currentPassword);
await reauthenticateWithCredential(user, credential);
await updatePassword(user, newPassword);
```

## トラブルシューティング

### よくある問題

1. **"Unauthorized" エラー**
   - ID Tokenが期限切れ: Firebase SDKが自動更新
   - トークンが送信されていない: `Authorization`ヘッダーを確認

2. **"User not found" エラー**
   - Firebase認証とデータベースの同期失敗: `/api/auth/sync`を呼び出し

3. **CORS エラー**
   - バックエンドのCORS設定を確認
   - `credentials: 'include'`が設定されているか確認

## 参考リンク

- [Firebase Authentication ドキュメント](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [Hono ドキュメント](https://hono.dev/)
