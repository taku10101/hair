# フロントエンドコーディング規約

## 基本方針

共通規約については[ルートのコーディング規約](../../../.ai-guide/coding-rules.md)を参照してください。
このドキュメントでは、フロントエンド固有の規約のみを記載します。

## コード品質ツール

- **Biome による統合リント・フォーマット**
  - 設定ファイル: `frontend/biome.json`
  - リント: `pnpm lint`
  - フォーマット: `pnpm format`
  - 自動修正: `pnpm lint:fix`

## ファイル・ディレクトリ命名規則

### コンポーネント
- **Reactコンポーネント**: PascalCase（例: `Button.tsx`, `UserProfile.tsx`）
- **カスタムフック**: camelCaseで`use`プレフィックス（例: `useAuth.ts`, `useFetchData.ts`）

### ディレクトリ
- **小文字**: ディレクトリは基本的に小文字（例: `components/`, `hooks/`, `lib/`）

## コンポーネント設計

### 関数コンポーネント優先
- クラスコンポーネントは使用しない
- 関数コンポーネントとHooksを使用

### Props型定義
```typescript
// Good
type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
  // ...
};
```

### コンポーネントの分離
- プレゼンテーションロジックとビジネスロジックを分離
- ビジネスロジックはカスタムフックに抽出

## Hooks使用規則

### カスタムフックの命名
- 必ず`use`プレフィックスを付ける
- 機能を表す明確な名前を使用

### Hooks呼び出しルール
- コンポーネントのトップレベルでのみ呼び出す
- 条件分岐やループ内で呼び出さない

### カスタムフックの責任分離

複雑な機能は、関心事ごとにカスタムフックを分離します。

#### 良い例: 複数のカスタムフックで責任を分離

```typescript
// hooks/useProfileForm.ts - プロフィール更新ロジック
export const useProfileForm = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.displayName || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsUpdating(true);
      await updateProfile({ name });
      await refreshUserData();
      setIsEditing(false);
      toast.success("プロフィールを更新しました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新に失敗しました");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setName(currentUser?.displayName || "");
    setIsEditing(false);
  };

  return {
    isEditing,
    setIsEditing,
    name,
    setName,
    isUpdating,
    handleSubmit,
    handleCancel,
  };
};

// hooks/usePasswordChange.ts - パスワード変更ロジック
export const usePasswordChange = () => {
  const [isChanging, setIsChanging] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    // パスワード変更ロジック
  };

  return {
    isChanging,
    setIsChanging,
    formData,
    updateField,
    handleChangePassword,
  };
};

// ProfilePage.tsx - UIコンポーネント
export function ProfilePage() {
  const { currentUser } = useAuth();
  const profileForm = useProfileForm();
  const passwordChange = usePasswordChange();

  return (
    // UIレンダリング
  );
}
```

#### 悪い例: 1つのコンポーネントに全てのロジックを記述

```typescript
// ❌ ProfilePage.tsx - ロジックとUIが混在
export function ProfilePage() {
  const { currentUser, refreshUserData } = useAuth();

  // プロフィール関連のstate
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // パスワード関連のstate
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // ... 多くのstate定義が続く

  // プロフィール更新処理
  const handleUpdateProfile = async () => {
    // 長い処理...
  };

  // パスワード変更処理
  const handleChangePassword = async () => {
    // 長い処理...
  };

  // 300行以上のコンポーネントになりがち
  return (
    // 複雑なUI
  );
}
```

## インポート順序

```typescript
// 1. React関連
import { useState, useEffect } from 'react';

// 2. 外部ライブラリ
import { useQuery } from '@tanstack/react-query';

// 3. 内部モジュール（絶対パス）
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 4. 相対パス
import { LocalComponent } from './LocalComponent';

// 5. 型定義
import type { User } from '@/types';

// 6. スタイル
import './styles.css';
```

## イベントハンドラ命名

```typescript
// Good
const handleClick = () => { /* ... */ };
const handleSubmit = () => { /* ... */ };
const handleChange = () => { /* ... */ };

// Bad
const onClick = () => { /* ... */ };
const clickHandler = () => { /* ... */ };
```

## TypeScript使用規則

### any禁止
- `any`型の使用は禁止
- 不明な型には`unknown`を使用

### 型アサーション
- 型アサーションは最小限に
- 必要な場合はコメントで理由を説明

### 型定義の配置
- ローカルな型は同じファイル内に定義
- 共通の型は`types`ディレクトリに配置

## 状態管理

### ローカル状態
- `useState`でコンポーネントローカルな状態を管理

### グローバル状態
- プロジェクト要件に応じて適切な状態管理ライブラリを選択
- Context APIは小規模な共有状態のみに使用

## パフォーマンス最適化

### メモ化

#### 基本方針
- リロード時やステート変更時に不要な再レンダリングを防ぐため、適切にメモ化を実施
- 過度な最適化は避けるが、ページコンポーネントやリストコンポーネントでは積極的に活用

#### useMemo - 値のメモ化

**使用すべきケース:**
```typescript
// ✅ 毎回生成されるオブジェクト/配列をメモ化
const columns = useMemo(() => createUserColumns(handleEdit), [handleEdit])

const exportColumns: ExportColumn[] = useMemo(() => [
  { key: "id", header: "ID", enabled: true },
  { key: "name", header: "名前", enabled: true },
], [])

// ✅ 重い計算処理をメモ化
const filteredData = useMemo(() => {
  return data.filter(item => complexFilter(item))
}, [data])
```

**使用不要なケース:**
```typescript
// ❌ シンプルな計算はメモ化不要
const doubled = number * 2 // useMemo不要

// ❌ プリミティブ値の単純な変換
const userName = user.name.toUpperCase() // useMemo不要
```

#### useCallback - 関数のメモ化

**使用すべきケース:**
```typescript
// ✅ 子コンポーネントに渡すイベントハンドラ
const handleEdit = useCallback((user: User) => {
  setEditingUser(user)
  setDialogOpen(true)
}, [])

// ✅ useEffect/useMemoの依存配列に含まれる関数
const handleSuccess = useCallback(() => {
  mutate()
}, [mutate])

// ✅ カスタムフックに渡すコールバック
const handleImport = useCallback(async (users: User[]) => {
  await importUsers(users)
  mutate()
}, [mutate])
```

**使用不要なケース:**
```typescript
// ❌ 子コンポーネントに渡さないローカル関数
const handleClick = () => {
  console.log('clicked') // useCallback不要
}

// ❌ 依存配列が空でない単純な関数
const getValue = () => value * 2 // valueが変わるたびに再生成されるべき
```

#### React.memo - コンポーネントのメモ化

**使用すべきケース:**
```typescript
// ✅ フィルターコンポーネント（個別に再レンダリング制御）
export const SearchFilter = memo(function SearchFilter({
  paramName,
  value,
  onChange
}: SearchFilterProps) {
  // ...
})

// ✅ リストアイテム（親の再レンダリング時に不要な再描画を防ぐ）
export const UserListItem = memo(({ user, onEdit }: UserListItemProps) => {
  // ...
})

// ✅ 重いレンダリング処理を持つコンポーネント
export const ComplexChart = memo(({ data }: ChartProps) => {
  // 重い描画処理
})
```

**使用不要なケース:**
```typescript
// ❌ 常に再レンダリングが必要なコンポーネント
export function Counter({ count }: { count: number }) {
  return <div>{count}</div> // memo不要
}

// ❌ Propsがほぼ毎回変わるコンポーネント
export function Clock({ time }: { time: Date }) {
  return <div>{time.toString()}</div> // memo不要
}
```

### 実装パターン例

#### ページコンポーネント
```typescript
export function UsersPage() {
  const { users, mutate } = useUsers()

  // イベントハンドラをメモ化
  const handleEdit = useCallback((user: User) => {
    setEditingUser(user)
    setDialogOpen(true)
  }, [])

  const handleSuccess = useCallback(() => {
    mutate()
  }, [mutate])

  // カラム定義をメモ化
  const columns = useMemo(() =>
    createUserColumns(handleEdit),
    [handleEdit]
  )

  // エクスポート設定をメモ化
  const exportColumns = useMemo(() => [
    { key: "id", header: "ID", enabled: true },
    { key: "name", header: "名前", enabled: true },
  ], [])

  return (
    <>
      <DataTable columns={columns} data={users} />
      <EditDialog onSuccess={handleSuccess} />
    </>
  )
}
```

#### フィルターコンポーネント
```typescript
// 各フィルターをmemoでメモ化
export const SearchFilter = memo(function SearchFilter({
  value,
  onChange
}: SearchFilterProps) {
  return <Input value={value} onChange={onChange} />
})

// フィルターフォーム
export function FilterForm({ filters }: FilterFormProps) {
  // ローカル状態とコールバックをメモ化
  const handleSearch = useCallback(() => {
    const params = buildSearchParams(filters, localValues)
    setUrlParams(params)
  }, [filters, localValues, setUrlParams])

  return (
    <div>
      {filters.map(filter => (
        <SearchFilter key={filter.id} {...filter} />
      ))}
      <Button onClick={handleSearch}>Search</Button>
    </div>
  )
}
```

### メモ化のチェックリスト

**ページレベル:**
- [ ] イベントハンドラ関数は`useCallback`でメモ化
- [ ] テーブルカラム定義は`useMemo`でメモ化
- [ ] エクスポート設定などの固定配列/オブジェクトは`useMemo`でメモ化
- [ ] 子コンポーネントに渡すコールバックは`useCallback`でメモ化

**コンポーネントレベル:**
- [ ] フィルター/フォームコンポーネントは`React.memo`でメモ化
- [ ] リストアイテムコンポーネントは`React.memo`でメモ化
- [ ] 重い計算処理は`useMemo`でメモ化

### コード分割
- ルートベースのコード分割を実施
- `React.lazy`と`Suspense`を使用

## フォーム実装パターン

### 基本方針

react-hook-formとInputFieldコンポーネントを使用してフォームを実装します。
コンポーネントの規模に応じて、適切な実装パターンを選択してください。

### パターン1: ページレベルのフォーム（大規模）

複雑なビジネスロジックを持つページフォームでは、カスタムフックで責任を分離します。

#### カスタムフック（ロジック層）

```typescript
// hooks/useLoginForm.ts
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/auth";
import { getAuthErrorMessage } from "@/lib/auth-errors";

interface LoginFormData {
  email: string;
  password: string;
}

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      const { field = "root", message } = getAuthErrorMessage(err);
      form.setError(field, { message });
    }
  };

  return {
    form,
    onSubmit,
  };
};
```

#### ページコンポーネント（UI層）

```typescript
import { FormProvider } from "react-hook-form";
import { InputField, SelectField } from "@/components/form";
import { Button } from "@/components/ui/Button";
import { useLoginForm } from "../hooks/useLoginForm";

export const LoginPage = () => {
  const { form, onSubmit } = useLoginForm();
  const { formState: { isSubmitting, errors } } = form;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          name="email"
          label="メールアドレス"
          type="email"
          rules={{
            required: "メールアドレスは必須です",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "有効なメールアドレスを入力してください",
            },
          }}
        />

        <InputField
          name="password"
          label="パスワード"
          type="password"
          rules={{ required: "パスワードは必須です" }}
        />

        {errors.root && (
          <div className="text-sm text-destructive">
            {String(errors.root.message)}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </Button>
      </form>
    </FormProvider>
  );
};
```

### パターン2: ダイアログ/モーダルのフォーム（小〜中規模）

ダイアログやモーダル内のフォームでは、コンポーネント内にロジックを含めることができます。

```typescript
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { InputField, SelectField } from "@/components/form";
import { authenticatedFetch } from "@/lib/apiClient";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  role: "ADMIN" | "SALARY";
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  const methods = useForm<UserFormData>({
    defaultValues: {
      name: "",
      email: "",
      role: "SALARY",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ダイアログが開いたときにフォームをリセット
  useEffect(() => {
    if (user) {
      methods.reset({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user, methods]);

  const handleSubmit = async (data: UserFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await authenticatedFetch(`/api/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <InputField
                name="name"
                label="名前"
                rules={{ required: "名前は必須です" }}
              />
              <InputField
                name="email"
                label="メールアドレス"
                type="email"
                rules={{
                  required: "メールアドレスは必須です",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "有効なメールアドレスを入力してください",
                  },
                }}
              />
              <SelectField
                name="role"
                label="ロール"
                options={[
                  { label: "SALARY", value: "SALARY" },
                  { label: "ADMIN", value: "ADMIN" },
                ]}
              />
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
```

### フォームコンポーネントの使用

`components/form/`ディレクトリには、`react-hook-form`と統合された汎用的なフォームコンポーネントが用意されています。
フォームフィールドを実装する際は、必ずこれらの汎用コンポーネントを使用してください。

#### 利用可能なコンポーネント

- **InputField**: テキスト入力（text, email, password, number等）
- **SelectField**: セレクトボックス
- **TextareaField**: 複数行テキスト入力
- **CheckboxField**: チェックボックス
- **DatePickerField**: 日付選択

すべてのコンポーネントは以下の機能を提供します：
- 自動的なフォーム登録
- バリデーションエラーの表示
- ラベルとフィールドの関連付け
- 一貫したスタイリング

#### InputField（基本的な入力フィールド）

```typescript
<InputField
  name="email"           // フォームフィールド名（必須）
  label="メールアドレス"  // ラベルテキスト
  type="email"           // input type
  placeholder="example@example.com"
  rules={{                // バリデーションルール
    required: "メールアドレスは必須です",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "有効なメールアドレスを入力してください",
    },
  }}
/>
```

#### SelectField（セレクトボックス）

```typescript
<SelectField
  name="role"
  label="ロール"
  options={[
    { label: "管理者", value: "ADMIN" },
    { label: "一般ユーザー", value: "USER" },
  ]}
  placeholder="選択してください"  // オプション
  rules={{ required: "ロールを選択してください" }}
/>
```

#### よく使うバリデーションルール

```typescript
// 必須フィールド
rules={{ required: "このフィールドは必須です" }}

// 最小文字数
rules={{
  required: "パスワードは必須です",
  minLength: {
    value: 8,
    message: "パスワードは8文字以上で入力してください",
  },
}}

// メールアドレス
rules={{
  required: "メールアドレスは必須です",
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: "有効なメールアドレスを入力してください",
  },
}}

// カスタムバリデーション
rules={{
  validate: (value) => {
    if (value !== password) {
      return "パスワードが一致しません";
    }
    return true;
  },
}}
```

### エラーハンドリング

#### フィールド固有のエラー

```typescript
form.setError("email", {
  message: "このメールアドレスは既に使用されています"
});
```

#### フォーム全体のエラー（root）

```typescript
form.setError("root", {
  message: "認証に失敗しました"
});

// 表示
{errors.root && (
  <div className="text-sm text-destructive">
    {String(errors.root.message)}
  </div>
)}
```

#### API エラーのハンドリング

```typescript
try {
  await apiCall(data);
  onSuccess();
} catch (err) {
  // エラーメッセージを状態に保存して表示
  setError(err instanceof Error ? err.message : "エラーが発生しました");

  // または特定のフィールドにエラーを設定
  form.setError("root", {
    message: err instanceof Error ? err.message : "エラーが発生しました"
  });
}
```

### FormProviderの使用

`FormProvider`は、フォームメソッドを子コンポーネントに提供します。
`InputField`を使用する場合は必須です。

```typescript
const methods = useForm<FormData>({ ... });

return (
  <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      {/* InputFieldはFormProviderから自動的にフォームメソッドを取得 */}
      <InputField name="email" label="メール" />
    </form>
  </FormProvider>
);
```

### 実装チェックリスト

**ページフォーム（大規模）:**
- [ ] カスタムフックでビジネスロジックを分離
- [ ] `useForm`で型定義とデフォルト値を設定
- [ ] `FormProvider`でフォームコンテキストを提供
- [ ] `InputField`でバリデーションルールを定義
- [ ] エラーハンドリングを実装

**ダイアログフォーム（小〜中規模）:**
- [ ] コンポーネント内で`useForm`を使用
- [ ] `useEffect`でフォームの初期化/リセット
- [ ] `FormProvider`でフォームコンテキストを提供
- [ ] `InputField`でバリデーションルールを定義
- [ ] `isSubmitting`で送信状態を管理

### ベストプラクティス

**✅ 適切な粒度で責任を分離:**
- 大規模フォーム: カスタムフック活用
- 小規模フォーム: コンポーネント内に実装

**✅ フォームコンポーネントの一貫した使用:**
- `components/form/`の汎用コンポーネントを使用（InputField, SelectField, TextareaField等）
- 直接`<input>`や`<select>`タグを使わない
- バリデーションルールをインラインで定義
- 日本語のエラーメッセージを設定

**✅ 型安全性:**
- フォームデータの型を明示的に定義
- TypeScriptの型チェックを活用

**✅ エラーメッセージの日本語化:**
- すべてのバリデーションに日本語メッセージを設定
- ユーザーフレンドリーなメッセージを記述
