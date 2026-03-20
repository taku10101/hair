# フロントエンド基盤構築 実装計画書
## プロジェクト概要
**プロジェクト名**: hair - フロントエンド基盤構築  
**期間**: 3-4週間  
**担当者**: フロントエンドエンジニア 2名  
**リポジトリ**: https://github.com/taku10101/hair/  
**Issue**: #2

## 1. 技術スタック

### コア技術
- **Next.js**: 14.x (App Router)
- **TypeScript**: 5.0+
- **React**: 18.x
- **Node.js**: 18.x LTS

### UI/UX & スタイリング
- **Tailwind CSS**: 3.4+
- **HeadlessUI**: アクセシブルなコンポーネント
- **Radix UI**: 高品質なプリミティブコンポーネント
- **Lucide React**: アイコンライブラリ

### 3D関連
- **Three.js**: 最新安定版
- **React Three Fiber**: Three.jsのReactバインディング
- **React Three Drei**: 便利なヘルパーコンポーネント
- **React Three PostProcessing**: ポストプロセシング効果

### 開発ツール
- **ESLint**: 8.x + TypeScript対応
- **Prettier**: 3.x + Tailwind CSS プラグイン
- **Husky**: Git hooks管理
- **lint-staged**: ステージングファイルのlint
- **Storybook**: 8.x

### テスト
- **Jest**: ユニットテスト
- **React Testing Library**: Reactコンポーネントテスト
- **Playwright**: E2Eテスト

### パフォーマンス最適化
- **Sharp**: 画像最適化
- **Bundle Analyzer**: バンドルサイズ分析
- **Lighthouse CI**: 継続的パフォーマンス監視

## 2. プロジェクト構造

```
hair/
├── .github/
│   ├── workflows/           # CI/CD設定
│   └── ISSUE_TEMPLATE/      # Issue テンプレート
├── .husky/                  # Git hooks
├── .storybook/             # Storybook設定
├── .vscode/                # VSCode設定
├── docs/                   # プロジェクトドキュメント
│   ├── component-guide.md  # コンポーネントガイド
│   └── development.md      # 開発ガイド
├── public/
│   ├── models/             # 3Dモデル (GLB/GLTF)
│   ├── textures/          # テクスチャ
│   └── fonts/             # カスタムフォント
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── globals.css    # グローバルCSS
│   │   ├── layout.tsx     # ルートレイアウト
│   │   └── page.tsx       # ホームページ
│   ├── components/        # UIコンポーネント
│   │   ├── ui/           # 基本UIコンポーネント
│   │   ├── three/        # 3D関連コンポーネント
│   │   ├── layout/       # レイアウトコンポーネント
│   │   └── forms/        # フォームコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── lib/              # ユーティリティ関数
│   │   ├── utils.ts      # 汎用ユーティリティ
│   │   ├── three/        # Three.js関連ユーティリティ
│   │   └── constants.ts  # 定数定義
│   ├── stores/           # 状態管理 (Zustand)
│   ├── styles/           # スタイル関連
│   └── types/            # TypeScript型定義
├── tests/                # テストファイル
│   ├── __mocks__/        # モック
│   ├── components/       # コンポーネントテスト
│   └── e2e/             # E2Eテスト
├── .env.example         # 環境変数テンプレート
├── .eslintrc.json       # ESLint設定
├── .gitignore
├── .prettierrc          # Prettier設定
├── commitlint.config.js # コミットメッセージlint
├── jest.config.js       # Jest設定
├── next.config.js       # Next.js設定
├── package.json
├── playwright.config.ts # Playwright設定
├── postcss.config.js    # PostCSS設定
├── README.md
├── tailwind.config.ts   # Tailwind CSS設定
└── tsconfig.json        # TypeScript設定
```

## 3. コンポーネント設計

### 3.1 基本UIコンポーネント (src/components/ui/)

#### Button
```tsx
// src/components/ui/Button/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}
```

#### Input
```tsx
// src/components/ui/Input/Input.tsx
interface InputProps {
  type?: string
  placeholder?: string
  error?: string
  label?: string
  required?: boolean
  disabled?: boolean
  value?: string
  onChange?: (value: string) => void
}
```

#### Card
```tsx
// src/components/ui/Card/Card.tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}
```

### 3.2 3Dコンポーネント (src/components/three/)

#### Scene
```tsx
// src/components/three/Scene/Scene.tsx
interface SceneProps {
  children: React.ReactNode
  enableControls?: boolean
  enablePhysics?: boolean
  backgroundColor?: string
  cameraPosition?: [number, number, number]
  className?: string
}
```

#### HairModel
```tsx
// src/components/three/HairModel/HairModel.tsx
interface HairModelProps {
  modelUrl: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  interactive?: boolean
  onInteraction?: (event: ThreeEvent<PointerEvent>) => void
}
```

#### LightingRig
```tsx
// src/components/three/LightingRig/LightingRig.tsx
interface LightingRigProps {
  preset?: 'studio' | 'natural' | 'dramatic' | 'soft'
  intensity?: number
  shadows?: boolean
}
```

### 3.3 レイアウトコンポーネント (src/components/layout/)

#### Header
```tsx
// src/components/layout/Header/Header.tsx
interface HeaderProps {
  navigation: NavigationItem[]
  logo?: string
  actions?: React.ReactNode
  sticky?: boolean
}
```

#### ResponsiveLayout
```tsx
// src/components/layout/ResponsiveLayout/ResponsiveLayout.tsx
interface ResponsiveLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
}
```

## 4. レスポンシブデザイン戦略

### ブレイクポイント定義
```typescript
// src/lib/constants.ts
export const BREAKPOINTS = {
  xs: '320px',    // モバイル（最小）
  sm: '480px',    // モバイル（大）
  md: '768px',    // タブレット
  lg: '1024px',   // デスクトップ（小）
  xl: '1280px',   // デスクトップ（中）
  '2xl': '1536px' // デスクトップ（大）
} as const
```

### Tailwind CSS設定
```javascript
// tailwind.config.ts
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '320px',
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      // カスタムカラーパレット
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      // カスタムスペーシング
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
}
```

## 5. パフォーマンス最適化戦略

### 5.1 Core Web Vitals目標
- **LCP (Largest Contentful Paint)**: < 2.5秒
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Lighthouse Score**: 90+

### 5.2 最適化手法

#### コード分割
```typescript
// 動的インポートによるコード分割
const HairSimulator = dynamic(() => import('@/components/three/HairSimulator'), {
  loading: () => <SkeletonLoader />,
  ssr: false, // 3Dコンポーネントはクライアントサイドのみ
})
```

#### 画像最適化
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 480, 768, 1024, 1280, 1920],
  },
}
```

#### 3D最適化
```typescript
// src/lib/three/optimization.ts
export const optimizeModel = (model: GLTF) => {
  // LOD (Level of Detail) 設定
  // テクスチャ圧縮
  // ジオメトリ簡略化
}
```

## 6. 開発手順・タイムライン

### Week 1: 基盤セットアップ
**Day 1-2: プロジェクト初期化**
- [ ] Next.js 14プロジェクト作成
- [ ] TypeScript 5.0+設定
- [ ] ESLint, Prettier, Husky設定
- [ ] Git hooks設定 (commit-msg, pre-commit)

**Day 3-4: 基本UI構築**
- [ ] Tailwind CSS設定
- [ ] ベースコンポーネント作成
- [ ] レスポンシブレイアウト実装

**Day 5: Storybook環境**
- [ ] Storybook 8.x設定
- [ ] 基本コンポーネントのStory作成
- [ ] アクセシビリティアドオン設定

### Week 2: 3D基盤構築
**Day 1-2: Three.js環境**
- [ ] React Three Fiber導入
- [ ] 基本シーンコンポーネント作成
- [ ] カメラ・ライティング設定

**Day 3-4: 3Dコンポーネント**
- [ ] HairModelコンポーネント実装
- [ ] インタラクション機能
- [ ] パフォーマンス最適化

**Day 5: 統合テスト**
- [ ] 3DコンポーネントのStory作成
- [ ] モバイル対応確認

### Week 3: 高度な機能実装
**Day 1-2: 状態管理**
- [ ] Zustand導入
- [ ] 3Dシーンの状態管理
- [ ] フォーム状態管理

**Day 3-4: アニメーション**
- [ ] Framer Motion導入
- [ ] ページトランジション
- [ ] 3Dアニメーション

**Day 5: パフォーマンス調整**
- [ ] バンドルサイズ最適化
- [ ] 画像最適化
- [ ] 3D最適化

### Week 4: テスト・最終調整
**Day 1-2: テスト実装**
- [ ] ユニットテスト (Jest + RTL)
- [ ] E2Eテスト (Playwright)
- [ ] Storybook テスト

**Day 3-4: 最終調整**
- [ ] Lighthouse監査
- [ ] アクセシビリティ監査
- [ ] ブラウザ互換性確認

**Day 5: ドキュメント整備**
- [ ] README更新
- [ ] コンポーネントガイド作成
- [ ] デプロイメントガイド

## 7. 品質保証

### 7.1 Linting & Formatting
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": [
    "@typescript-eslint",
    "jsx-a11y",
    "import"
  ],
  "rules": {
    "prefer-const": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "jsx-a11y/alt-text": "error"
  }
}
```

### 7.2 Git Hooks
```javascript
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint-staged
npm run type-check
```

### 7.3 CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npm run type-check
      - name: Test
        run: npm run test
      - name: Build
        run: npm run build
      - name: Lighthouse CI
        run: npm run lighthouse
```

## 8. チーム分担案

### エンジニア A: UI/UX スペシャリスト
**担当領域**:
- 基本UIコンポーネント設計・実装
- レスポンシブレイアウト
- Storybook環境構築
- アクセシビリティ対応
- デザインシステム構築

**週次タスク**:
- Week 1: プロジェクト基盤 + UIコンポーネント
- Week 2: レスポンシブ対応 + Storybook
- Week 3: アニメーション + インタラクション
- Week 4: UI/UXテスト + ドキュメント

### エンジニア B: 3D & パフォーマンススペシャリスト
**担当領域**:
- Three.js基盤構築
- 3Dコンポーネント実装
- パフォーマンス最適化
- バンドルサイズ最適化
- 3Dアニメーション

**週次タスク**:
- Week 1: 開発環境設定サポート
- Week 2: 3D基盤 + コアコンポーネント
- Week 3: 3D最適化 + 高度な機能
- Week 4: パフォーマンステスト + 最終調整

## 9. リスクと対策

### 技術リスク
| リスク | 影響度 | 対策 |
|-------|--------|------|
| 3Dパフォーマンス問題 | 高 | LOD実装、プリロード戦略 |
| モバイル3D対応 | 中 | フォールバック2D実装 |
| バンドルサイズ肥大化 | 中 | 動的インポート、Tree shaking |

### スケジュールリスク
| リスク | 影響度 | 対策 |
|-------|--------|------|
| 3D実装の複雑化 | 高 | MVP定義、段階的実装 |
| レスポンシブ調整時間 | 中 | モバイルファースト開発 |
| テスト工数不足 | 中 | TDD、継続的テスト |

## 10. 成功指標

### 技術指標
- [ ] Lighthouse Performance Score: 90+
- [ ] Bundle Size: < 300KB (gzipped)
- [ ] 3D初期化時間: < 2秒
- [ ] レスポンシブ対応: 320px ~ 4K

### 品質指標
- [ ] ESLint エラー: 0
- [ ] TypeScript エラー: 0
- [ ] テストカバレッジ: 80%+
- [ ] Storybook カバレッジ: 100% (UIコンポーネント)

### UX指標
- [ ] First Contentful Paint: < 1.5秒
- [ ] Time to Interactive: < 3秒
- [ ] 3D操作レスポンス: < 16ms (60fps)

## 11. 参考資料

### 公式ドキュメント
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Storybook](https://storybook.js.org/docs)

### ベストプラクティス
- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Three.js Optimization](https://discoverthreejs.com/tips-and-tricks/)
- [React Performance Patterns](https://kentcdodds.com/blog/optimize-react-re-renders)

---

**策定者**: フロントエンドエンジニア（サブエージェント）  
**策定日**: 2026-03-20  
**更新予定**: プロジェクト開始時に詳細調整