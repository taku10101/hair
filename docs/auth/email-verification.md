# メール確認機能

## 概要

ユーザー登録時にFirebase Authenticationのメール確認機能を使用して、メールアドレスの所有権を確認します。

## 機能の流れ

1. **ユーザー登録** (`/signup`)
   - ユーザーがメールアドレス、パスワード、名前を入力
   - Firebase Authenticationでアカウント作成
   - メール確認リンクを送信（設定により省略可能）
   - バックエンドAPIでDBにユーザー情報を保存

2. **メール確認**
   - ユーザーがメールに届いたリンクをクリック
   - Firebaseが自動的に `emailVerified` を `true` に更新
   - 次回ログイン時にDBの `emailVerified` も同期される

3. **ログイン時の同期**
   - `/api/auth/me` エンドポイントでFirebaseトークンから `email_verified` を取得
   - DBの `emailVerified` フィールドを更新

## 環境変数設定

### フロントエンド (frontend/.env)

```bash
# メール確認を有効化（本番環境では必須）
VITE_ENABLE_EMAIL_VERIFICATION=true

# 開発環境でメール確認をスキップする場合
VITE_ENABLE_EMAIL_VERIFICATION=false
```

## 実装詳細

### フロントエンド

**useSignupForm.ts**
```typescript
import { sendEmailVerification } from "firebase/auth";

// サインアップ処理
const userCredential = await signUp(data.email, data.password);

// メール確認送信（設定により省略可能）
if (import.meta.env.VITE_ENABLE_EMAIL_VERIFICATION !== "false") {
  await sendEmailVerification(userCredential.user);
}

// DB同期
await authenticatedFetch("/api/auth/sync", {
  method: "POST",
  body: JSON.stringify({ name: data.name }),
});
```

### バックエンド

**authService.ts**
```typescript
async getOrCreateUserByFirebaseUid(
  firebaseUid: string,
  email: string,
  name?: string,
  emailVerified?: boolean  // Firebaseトークンから取得
): Promise<User> {
  // ユーザー作成または更新時にemailVerifiedを同期
  user = await userRepository.create({
    email,
    name: name || email.split("@")[0],
    role: "SALARY",
    firebaseUid,
    emailVerified: emailVerified ?? false,  // Firebaseの状態を反映
    lastSignInMethod: "email",
  });
}
```

**authController.ts**
```typescript
async syncUser(c: Context) {
  const decodedToken = c.get("user");

  // Firebaseトークンからemail_verifiedを取得
  const user = await authService.syncUserFromFirebase(
    decodedToken.uid,
    decodedToken.email || "",
    name,
    decodedToken.email_verified  // Firebaseの認証状態
  );
}
```

## 開発時の注意点

### メール確認をスキップする場合

開発環境でメール送信をテストしない場合:

```bash
# frontend/.env
VITE_ENABLE_EMAIL_VERIFICATION=false
```

この設定でも:
- Firebase認証は正常に動作
- DBにユーザー情報は保存される
- `emailVerified` は `false` のまま

### メール確認を有効化する場合

Firebase Consoleで以下の設定が必要:

1. **Authentication > Templates** でメールテンプレートを設定
2. **Authentication > Sign-in method** で「Email/Password」を有効化
3. **Authentication > Settings** で送信元メールアドレスを確認

## トラブルシューティング

### ユーザー情報がDBに保存されない

1. **データベース接続を確認**
   ```bash
   docker ps | grep postgres
   ```

2. **バックエンドのログを確認**
   ```bash
   # backend側のターミナルで確認
   [AuthService] Creating new user with name: ...
   [AuthService] User created successfully: 1
   ```

3. **ブラウザのコンソールを確認**
   ```
   User registered successfully: user@example.com
   ```

### メール確認が送信されない

1. **環境変数を確認**
   ```bash
   echo $VITE_ENABLE_EMAIL_VERIFICATION
   ```

2. **Firebase Consoleでメール送信履歴を確認**
   - Authentication > Users でユーザーのメール確認状態を確認

3. **スパムフォルダを確認**
   - Gmailなどでスパム扱いされることがある

## データベーススキーマ

```prisma
model User {
  id               Int      @id @default(autoincrement())
  firebaseUid      String?  @unique
  email            String   @unique
  name             String
  emailVerified    Boolean  @default(false)  // Firebaseと同期
  lastSignInMethod String?
  // ...
}
```

## セキュリティ考慮事項

1. **本番環境では必ずメール確認を有効化**
   - なりすまし登録を防ぐため

2. **メール確認前のアクセス制限**
   - 重要な機能には `emailVerified` チェックを追加
   ```typescript
   if (!user.emailVerified) {
     return c.json({ error: "Email not verified" }, 403);
   }
   ```

3. **再送機能の実装**
   - メールが届かない場合のための再送ボタン
   ```typescript
   const resendVerification = async () => {
     if (currentUser) {
       await sendEmailVerification(currentUser);
     }
   };
   ```
