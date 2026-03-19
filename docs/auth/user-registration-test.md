# ユーザー登録機能のテスト手順

## 前提条件

1. **データベースが起動していること**
   ```bash
   docker ps | grep postgres
   # web_template_postgres が Up 状態であることを確認
   ```

2. **バックエンドが起動していること**
   ```bash
   cd backend
   pnpm dev
   # Server running at http://localhost:3088
   ```

3. **フロントエンドが起動していること**
   ```bash
   cd frontend
   pnpm dev
   # Local: http://localhost:5173/
   ```

## テストケース

### 1. 新規ユーザー登録（正常系）

#### 手順

1. ブラウザで `http://localhost:5173/signup` にアクセス

2. 以下の情報を入力:
   - 名前: `テストユーザー`
   - メールアドレス: `test@example.com`
   - パスワード: `password123`

3. 「登録」ボタンをクリック

#### 期待される動作

**フロントエンド（ブラウザコンソール）:**
```
Email verification sent to: test@example.com
(または)
Email verification skipped in development mode
User registered successfully: test@example.com
```

**バックエンド（ターミナル）:**
```
[AuthService] getOrCreateUserByFirebaseUid called: test@example.com, firebaseUid: xxxx
[AuthService] User not found by firebaseUid, checking by email: test@example.com
[AuthService] Creating new user with name: テストユーザー
[AuthService] User created successfully: 1, name: テストユーザー
```

**データベース確認:**
```bash
# Prisma Studioで確認
cd backend
npx prisma studio

# または、直接SQLで確認
docker exec -it web_template_postgres psql -U postgres -d web_template -c "SELECT * FROM users;"
```

期待される結果:
```
 id | firebase_uid | email            | name           | email_verified
----+--------------+------------------+----------------+----------------
  1 | xxxx         | test@example.com | テストユーザー | f (false)
```

**画面遷移:**
- ログイン後、ホーム画面（`/`）にリダイレクト

### 2. メール確認フローのテスト（オプション）

#### 前提条件
```bash
# frontend/.env
VITE_ENABLE_EMAIL_VERIFICATION=true
```

#### 手順

1. 新規ユーザー登録を実行

2. 登録したメールアドレスの受信トレイを確認

3. Firebase から送信された確認メールを開く

4. 「メールアドレスを確認」ボタンをクリック

5. 確認完了ページが表示される

6. アプリに戻り、ログアウト→再ログイン

#### 期待される動作

再ログイン後、DBの `email_verified` が `true` に更新される:
```sql
SELECT email_verified FROM users WHERE email = 'test@example.com';
-- 結果: t (true)
```

### 3. 重複登録のエラーハンドリング

#### 手順

1. 既に登録済みのメールアドレスで登録を試みる
   - メールアドレス: `test@example.com`（前のテストで使用）
   - パスワード: `password456`

#### 期待される動作

**Firebase エラー:**
```
auth/email-already-in-use
```

**画面表示:**
- エラーメッセージ「このメールアドレスは既に使用されています」が表示される
- 登録は完了せず、フォームに留まる

### 4. バリデーションエラー

#### テスト 4-1: 無効なメールアドレス

入力:
- メールアドレス: `invalid-email`

期待される動作:
- 「有効なメールアドレスを入力してください」エラー表示

#### テスト 4-2: 短すぎるパスワード

入力:
- パスワード: `pass`（8文字未満）

期待される動作:
- 「パスワードは8文字以上で入力してください」エラー表示

#### テスト 4-3: 名前が空

入力:
- 名前: （空欄）

期待される動作:
- 「名前を入力してください」エラー表示

### 5. ログイン後のユーザー情報取得

#### 手順

1. 登録したユーザーでログイン
   - メールアドレス: `test@example.com`
   - パスワード: `password123`

2. ブラウザの開発者ツール > Network タブで `/api/auth/me` のレスポンスを確認

#### 期待されるレスポンス

```json
{
  "user": {
    "id": 1,
    "firebaseUid": "xxxx",
    "email": "test@example.com",
    "name": "テストユーザー",
    "role": "SALARY",
    "photoUrl": null,
    "emailVerified": false,
    "lastSignInMethod": "email",
    "createdAt": "2026-02-08T...",
    "updatedAt": "2026-02-08T..."
  }
}
```

## トラブルシューティング

### ユーザー情報がDBに保存されない

**症状:**
- Firebase認証は成功するがDBにレコードが作成されない

**確認手順:**

1. **データベース接続を確認**
   ```bash
   cd backend
   npx prisma db push
   ```

   エラーが出る場合:
   ```bash
   # PostgreSQLコンテナを確認
   docker ps -a | grep postgres

   # 停止している場合は起動
   docker start web_template_postgres
   ```

2. **バックエンドのログを確認**

   エラーメッセージがないか確認:
   ```
   Error: P1001 - Can't reach database server
   ```

3. **環境変数を確認**
   ```bash
   cd backend
   cat .env | grep DATABASE_URL
   ```

   ポート番号などが正しいか確認

4. **APIエンドポイントの応答を確認**
   ```bash
   # 認証トークン取得（ブラウザコンソールで実行）
   const token = await firebase.auth().currentUser.getIdToken();
   console.log(token);

   # API呼び出しテスト
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:3088/api/auth/me
   ```

### メール確認メールが届かない

**確認項目:**

1. **環境変数の設定**
   ```bash
   # frontend/.env
   echo $VITE_ENABLE_EMAIL_VERIFICATION
   # true になっているか確認
   ```

2. **Firebase Console の設定**
   - Authentication > Templates でメールテンプレートが設定されているか
   - Authentication > Settings で送信元メールアドレスが設定されているか

3. **スパムフォルダ**
   - Gmailなどのスパムフォルダを確認

4. **Firebase Auth エラー**
   - ブラウザコンソールにエラーが出ていないか確認

### 開発環境でメール確認をスキップしたい

```bash
# frontend/.env
VITE_ENABLE_EMAIL_VERIFICATION=false
```

この設定で:
- Firebase認証は正常に動作
- メール送信はスキップ
- DBには `emailVerified: false` で保存

## クリーンアップ

テスト後、データをクリーンアップする場合:

```bash
# データベースをリセット
cd backend
npx prisma db push --force-reset

# または、特定のユーザーを削除
docker exec -it web_template_postgres psql -U postgres -d web_template -c "DELETE FROM users WHERE email = 'test@example.com';"

# Firebase Authenticationのユーザーも削除
# Firebase Console > Authentication > Users から手動削除
```

## 自動テストの実行

```bash
# フロントエンドのテスト
cd frontend
pnpm test

# バックエンドのテスト
cd backend
pnpm test
```

## 次のステップ

- [ ] メール確認済みユーザーのみアクセス可能な機能の実装
- [ ] メール確認の再送機能の実装
- [ ] パスワードリセット機能の実装
- [ ] ソーシャルログイン（Google, GitHub等）の追加
