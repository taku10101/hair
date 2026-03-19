# コンポーネント設計指針

## コンポーネント分類

### 1. UIコンポーネント（Presentational Components）
- **目的**: 表示のみを担当
- **配置**: `components/ui/`
- **特徴**:
  - ビジネスロジックを持たない
  - Propsで全てのデータを受け取る
  - 再利用性が高い

```typescript
// Good: UIコンポーネント
type ButtonProps = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
};

export const Button = ({ label, onClick, variant = 'primary' }: ButtonProps) => {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
};
```

### 2. コンテナコンポーネント（Container Components）
- **目的**: ビジネスロジックとデータ取得を担当
- **配置**: `routes/` または `components/`
- **特徴**:
  - カスタムフックを使用してロジックを実装
  - UIコンポーネントを組み合わせる

```typescript
// Good: コンテナコンポーネント
export const UserProfile = () => {
  const { user, loading } = useUser();

  if (loading) return <Spinner />;

  return (
    <div>
      <Avatar src={user.avatar} />
      <Text>{user.name}</Text>
    </div>
  );
};
```

## コンポーネント設計原則

### Single Responsibility Principle（単一責任の原則）
- 1つのコンポーネントは1つの責任のみを持つ
- 複雑なコンポーネントは複数の小さなコンポーネントに分割

### Composition（合成）
- 継承ではなく合成を使用
- `children` Propsを活用

```typescript
// Good: 合成パターン
type CardProps = {
  children: React.ReactNode;
  title?: string;
};

export const Card = ({ children, title }: CardProps) => {
  return (
    <div className="card">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
};

// 使用例
<Card title="User Info">
  <UserProfile />
</Card>
```

### Props Drilling回避
- 深いネストでのProps渡しを避ける
- Context APIまたは状態管理ライブラリを使用

## コンポーネントファイル構成

```typescript
// 1. Import
import { useState } from 'react';
import type { User } from '@/types';

// 2. 型定義
type UserCardProps = {
  user: User;
  onEdit: (id: string) => void;
};

// 3. コンポーネント実装
export const UserCard = ({ user, onEdit }: UserCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 4. サブコンポーネント（必要な場合）
const UserDetail = ({ user }: { user: User }) => {
  return <div>{/* ... */}</div>;
};
```

## カスタムフック活用

### ビジネスロジックの抽出
```typescript
// hooks/useUser.ts
export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  return { user, loading };
};

// components/UserProfile.tsx
export const UserProfile = ({ userId }: { userId: string }) => {
  const { user, loading } = useUser(userId);

  if (loading) return <Spinner />;
  if (!user) return <NotFound />;

  return <UserCard user={user} />;
};
```

### フォーム状態管理のカスタムフック

フォーム関連のロジックは、カスタムフックに切り出すことで再利用性とテスタビリティが向上します。

#### パターン1: 単純なフォーム管理

```typescript
// routes/profile/hooks/useProfileForm.ts
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { updateProfile } from "../api";

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
```

#### パターン2: 複数フィールドのフォーム管理

```typescript
// routes/profile/hooks/usePasswordChange.ts
import { useState } from "react";
import { toast } from "sonner";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const usePasswordChange = () => {
  const [isChanging, setIsChanging] = useState(false);
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const updateField = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const resetForm = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChanging(false);
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("新しいパスワードが一致しません");
      return;
    }
    // パスワード変更処理
  };

  return {
    isChanging,
    setIsChanging,
    formData,
    showPasswords,
    updateField,
    togglePasswordVisibility,
    handleChangePassword,
    resetForm,
    isFormValid: formData.currentPassword !== "" &&
                 formData.newPassword !== "" &&
                 formData.confirmPassword !== "",
  };
};
```

#### ページコンポーネントでの使用

```typescript
// routes/profile/index.tsx
export function ProfilePage() {
  const { currentUser } = useAuth();
  const profileForm = useProfileForm();
  const passwordChange = usePasswordChange();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* プロフィールフォーム */}
      {profileForm.isEditing ? (
        <div>
          <Input
            value={profileForm.name}
            onChange={(e) => profileForm.setName(e.target.value)}
          />
          <Button onClick={profileForm.handleSubmit} disabled={profileForm.isUpdating}>
            保存
          </Button>
          <Button onClick={profileForm.handleCancel}>キャンセル</Button>
        </div>
      ) : (
        <Button onClick={() => profileForm.setIsEditing(true)}>編集</Button>
      )}

      {/* パスワード変更フォーム */}
      {passwordChange.isChanging && (
        <div>
          <Input
            type={passwordChange.showPasswords.current ? "text" : "password"}
            value={passwordChange.formData.currentPassword}
            onChange={(e) => passwordChange.updateField("currentPassword", e.target.value)}
          />
          <Button
            onClick={passwordChange.handleChangePassword}
            disabled={!passwordChange.isFormValid}
          >
            変更
          </Button>
        </div>
      )}
    </div>
  );
}
```

### カスタムフック設計のベストプラクティス

**✅ 単一責任の原則を守る**
- 1つのカスタムフックは1つの関心事のみを扱う
- `useProfileForm`と`usePasswordChange`を分離

**✅ 関連する状態をまとめる**
- 関連するstateは1つのオブジェクトにまとめる
- `formData`や`showPasswords`のようにグループ化

**✅ バリデーションロジックをフックに含める**
- `isFormValid`のような計算プロパティを返す
- UIコンポーネントはロジックを持たない

**✅ エラーハンドリングをフック内で完結させる**
- `toast`によるユーザー通知をフック内で行う
- UIコンポーネントはエラー処理を意識しない

**✅ API呼び出しを別ファイルに分離**
- `api.ts`にAPI関数を定義
- カスタムフックはAPI関数を呼び出すのみ

## shadcn/ui コンポーネントの使用

### 基本方針
- `components/ui/`配下にshadcn/uiコンポーネントを配置
- そのまま使用するか、プロジェクト固有の拡張を加える

### カスタマイズ
```typescript
// components/ui/button.tsx (shadcn/ui)
import { Button as ShadcnButton } from './shadcn-button';

// プロジェクト固有の拡張
export const Button = ({ loading, ...props }: ButtonProps) => {
  return (
    <ShadcnButton {...props} disabled={loading || props.disabled}>
      {loading ? <Spinner /> : props.children}
    </ShadcnButton>
  );
};
```

## コンポーネントテスト

### テスト対象
- ユーザーインタラクション
- 条件分岐による表示切り替え
- Propsによる表示変化

### テスト例
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('クリックイベントが発火する', () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## パフォーマンス最適化

### メモ化の判断基準
```typescript
// 不要な例: シンプルな計算
const doubled = number * 2; // useMemo不要

// 必要な例: 重い計算
const expensiveResult = useMemo(() => {
  return performHeavyCalculation(data);
}, [data]);

// 必要な例: オブジェクト/配列の参照
const config = useMemo(() => ({
  option1: value1,
  option2: value2
}), [value1, value2]);
```

### React.memo使用
```typescript
// 親コンポーネントの再レンダリング時に不要な再レンダリングを防ぐ
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{/* 重いレンダリング処理 */}</div>;
});
```
