# スタイリング規約

## スタイリング手法

### 1. Tailwind CSS（推奨）
- ユーティリティファーストCSSフレームワーク
- インラインでクラスを適用

```tsx
// Good
export const Button = ({ label }: Props) => {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      {label}
    </button>
  );
};
```

### 2. CSS Modules
- スコープ化されたCSS
- グローバル汚染を防ぐ

```tsx
// Button.module.css
.button {
  padding: 0.5rem 1rem;
  background-color: blue;
}

// Button.tsx
import styles from './Button.module.css';

export const Button = ({ label }: Props) => {
  return <button className={styles.button}>{label}</button>;
};
```

### 3. グローバルCSS
- `index.css`にグローバルスタイルを定義
- リセットCSS、基本フォント設定など

## Tailwind CSS ベストプラクティス

### クラス名の順序
1. レイアウト（display, position）
2. ボックスモデル（width, height, padding, margin）
3. タイポグラフィ（font, text）
4. ビジュアル（color, background, border）
5. その他（transition, transformなど）

```tsx
// Good: 順序に従った記述
<div className="flex items-center w-full p-4 text-lg font-bold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 transition-colors">
  Content
</div>
```

### クラス名が長くなる場合
```tsx
// Good: cn関数を使用してクラスを結合
import { cn } from '@/lib/utils';

const buttonClass = cn(
  'px-4 py-2 rounded',
  'bg-blue-500 text-white',
  'hover:bg-blue-600',
  'disabled:opacity-50 disabled:cursor-not-allowed'
);

<button className={buttonClass}>Click</button>
```

### 条件付きスタイル
```tsx
// Good
import { cn } from '@/lib/utils';

type ButtonProps = {
  variant: 'primary' | 'secondary';
  disabled?: boolean;
};

export const Button = ({ variant, disabled }: ButtonProps) => {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      Button
    </button>
  );
};
```

## レスポンシブデザイン

### ブレークポイント
Tailwindのデフォルトブレークポイントを使用：
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### モバイルファースト
```tsx
// Good: モバイルファーストアプローチ
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* モバイルは100%幅、タブレットは50%、デスクトップは33% */}
</div>
```

## カラーパレット

### テーマカラーの定義
- Tailwindの設定ファイルでカスタムカラーを定義
- セマンティックな名前を使用

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#...',
          500: '#...',
          900: '#...',
        },
        secondary: { /* ... */ },
      },
    },
  },
};
```

### カラー使用ガイドライン
```tsx
// Good: セマンティックなカラー使用
<button className="bg-primary-500 hover:bg-primary-600">Primary</button>
<button className="bg-secondary-500 hover:bg-secondary-600">Secondary</button>

// Bad: 直接色を指定
<button className="bg-blue-500">Button</button>
```

## タイポグラフィ

### フォントサイズ
```tsx
// Tailwindのフォントサイズスケールを使用
<h1 className="text-4xl font-bold">見出し1</h1>
<h2 className="text-3xl font-bold">見出し2</h2>
<p className="text-base">本文</p>
<small className="text-sm">小さいテキスト</small>
```

### 行間・文字間
```tsx
<p className="leading-relaxed tracking-wide">
  読みやすい本文テキスト
</p>
```

## スペーシング（余白）

### 一貫性のある余白
- Tailwindのスペーシングスケール（4pxベース）を使用
- `p-*`（padding）、`m-*`（margin）

```tsx
// Good
<div className="p-4 m-2">
  <div className="mb-4">Section 1</div>
  <div className="mb-4">Section 2</div>
</div>
```

## アニメーション・トランジション

### Tailwindのトランジション
```tsx
// Good: スムーズなホバー効果
<button className="bg-blue-500 hover:bg-blue-600 transition-colors duration-200">
  Hover me
</button>

// アニメーション
<div className="animate-pulse">Loading...</div>
<div className="animate-spin">⟳</div>
```

### カスタムアニメーション
- 必要に応じてTailwind設定でカスタムアニメーションを定義

## ダークモード

### ダークモード対応
```tsx
// Good: dark:プレフィックスでダークモード対応
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

## アクセシビリティ

### フォーカススタイル
```tsx
// Good: キーボードナビゲーション対応
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Accessible Button
</button>
```

### カラーコントラスト
- WCAG AA基準以上のコントラスト比を維持
- テキストと背景のコントラストに注意

## スタイルの抽出

### 繰り返しスタイルの共通化
```typescript
// lib/styles.ts
export const buttonBaseClass = 'px-4 py-2 rounded font-medium transition-colors';
export const buttonPrimaryClass = cn(buttonBaseClass, 'bg-blue-500 text-white hover:bg-blue-600');
export const buttonSecondaryClass = cn(buttonBaseClass, 'bg-gray-200 text-gray-800 hover:bg-gray-300');
```

## パフォーマンス

### 未使用スタイルの削除
- Tailwind CSSのPurgeCSSが自動的に未使用スタイルを削除
- `tailwind.config.js`の`content`設定を正しく設定

```javascript
// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
};
```
