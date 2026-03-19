# テスト戦略ガイド

このドキュメントでは、web_template プロジェクトにおけるテスト戦略、実行方法、およびカバレッジ基準について説明します。

## テストの種類と粒度

### バックエンドテスト（Hono）

#### ユニットテスト

- **場所**: `backend/src/**/*.test.ts`（ソースコードと並置）
- **実行**: `cd backend && pnpm test`
- **対象**: 個別の関数、メソッドの動作検証
- **カバレッジ目標**: 80%以上
- **フレームワーク**: Vitest

#### 統合テスト

- **場所**: `backend/src/**/*.integration.test.ts`
- **実行**: `cd backend && pnpm test:integration`
- **対象**: データベース（Prisma）とビジネスロジックの統合
- **特徴**: テスト用データベースを使用

#### API テスト

- **場所**: `backend/src/**/*.api.test.ts`
- **実行**: `cd backend && pnpm test:api`
- **対象**: Hono エンドポイントの動作検証
- **特徴**: Hono の `testClient` を使用した HTTP リクエスト/レスポンスの検証

### フロントエンドテスト（React）

#### ユニットテスト

- **場所**: `frontend/src/**/*.test.tsx`（コンポーネントと並置）
- **実行**: `cd frontend && pnpm test`
- **対象**: 個別のコンポーネント、フック、ユーティリティ関数
- **カバレッジ目標**: 80%以上
- **フレームワーク**: Vitest + React Testing Library

#### コンポーネントテスト

- **場所**: `frontend/src/components/**/*.test.tsx`
- **対象**: UI コンポーネントのレンダリングと相互作用
- **ツール**:
  - Vitest: テストランナー
  - React Testing Library: コンポーネントテスト
  - @testing-library/user-event: ユーザーインタラクション

#### フックテスト

- **場所**: `frontend/src/hooks/**/*.test.ts`
- **対象**: カスタム React フック
- **ツール**: @testing-library/react-hooks

#### E2E テスト

- **場所**: `frontend/e2e/**/*.spec.ts`
- **実行**: `cd frontend && pnpm test:e2e`
- **ツール**: Playwright
- **対象**: エンドツーエンドのユーザーシナリオ検証

## テスト実行コマンド

### ワークスペース全体

pnpm workspace を使用しているため、ルートディレクトリから全てのパッケージのテストを実行できます。

```bash
# ルートディレクトリで実行

# 全パッケージでテスト実行
pnpm test

# 全パッケージで型チェック
pnpm typecheck

# 全パッケージでリント実行
pnpm lint

# 全パッケージでビルド
pnpm build
```

### バックエンド

```bash
cd backend

# すべてのテストを実行
pnpm test

# ウォッチモードでテスト実行
pnpm test:watch

# カバレッジレポート付きテスト
pnpm test:coverage

# UI モードでテスト実行（対話的）
pnpm test:ui

# 型チェック
pnpm typecheck

# リント
pnpm lint

# フォーマット
pnpm format

# すべてのチェックを実行
pnpm check  # typecheck + lint + test
```

### フロントエンド

```bash
cd frontend

# すべてのテストを実行
pnpm test

# ウォッチモードでテスト実行
pnpm test:watch

# カバレッジレポート付きテスト
pnpm test:coverage

# UI モードでテスト実行
pnpm test:ui

# E2E テストを実行
pnpm test:e2e

# E2E テストを UI モードで実行
pnpm test:e2e:ui

# 特定のテストファイルのみ実行
pnpm test -- path/to/test.test.tsx

# 型チェック（ビルド時に実行）
pnpm build

# リント
pnpm lint

# リント自動修正
pnpm lint --fix
```

## テスト環境設定

### バックエンドテスト環境

#### Prisma テストデータベース

```typescript
// backend/src/lib/testSetup.ts
import { PrismaClient } from '@prisma/client'
import { beforeEach, afterEach } from 'vitest'

const prisma = new PrismaClient()

beforeEach(async () => {
  // テストデータのセットアップ
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.post.deleteMany(),
  ])
})

afterEach(async () => {
  // クリーンアップ
  await prisma.$disconnect()
})
```

#### Hono テストクライアント

```typescript
// backend/src/presentation/user.api.test.ts
import { describe, it, expect } from 'vitest'
import { testClient } from 'hono/testing'
import app from '../index'

const client = testClient(app)

describe('User API', () => {
  it('should return user list', async () => {
    const res = await client.api.users.$get()
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toHaveProperty('users')
  })
})
```

### フロントエンドテスト環境

#### SWR モックセットアップ

```typescript
// frontend/src/test/setup.ts
import { SWRConfig } from 'swr'
import { vi } from 'vitest'

// SWR のキャッシュをクリア
beforeEach(() => {
  vi.clearAllMocks()
})

// テスト用 SWR ラッパー
export const SWRTestWrapper = ({ children }) => (
  <SWRConfig value={{ provider: () => new Map() }}>
    {children}
  </SWRConfig>
)
```

#### React Router モック

```typescript
// frontend/src/test/routerMock.tsx
import { MemoryRouter } from 'react-router'

export const RouterTestWrapper = ({
  children,
  initialEntries = ['/']
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    {children}
  </MemoryRouter>
)
```

## カバレッジ基準

### コードカバレッジ目標

- **ユニットテスト**: 80%以上
- **統合テスト**: 70%以上
- **E2E テスト**: 主要なユーザーシナリオを網羅
- **重要モジュール**: 90%以上（認証、決済、セキュリティ関連）

### カバレッジ測定ツール

- **Vitest Coverage**: `@vitest/coverage-v8`
- **レポート出力**: `coverage/` ディレクトリ
- **HTML レポート**: `coverage/index.html`
- **形式**: lcov, html, text

```bash
# 全パッケージでカバレッジレポート生成（ルートから）
pnpm test:coverage

# または個別に実行
cd frontend && pnpm test:coverage
cd backend && pnpm test:coverage

# HTML レポートをブラウザで開く
open frontend/coverage/index.html
open backend/coverage/index.html
```

## テスト作成のベストプラクティス

### 命名規則

#### テストファイル

```
ComponentName.test.tsx      # コンポーネントテスト
useHookName.test.ts        # フックテスト
utilityName.test.ts        # ユーティリティテスト
apiHandler.api.test.ts     # API テスト
service.integration.test.ts # 統合テスト
```

#### テストケース

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {
      // Arrange
      const userData = { name: 'John', email: 'john@example.com' }

      // Act
      const result = createUser(userData)

      // Assert
      expect(result).toHaveProperty('id')
      expect(result.name).toBe('John')
    })

    it('should throw error with invalid email', () => {
      const userData = { name: 'John', email: 'invalid' }

      expect(() => createUser(userData)).toThrow('Invalid email')
    })
  })
})
```

### テストの構造

- **AAA（Arrange-Act-Assert）パターンを使用**
- **各テストは独立して実行可能に**
- **外部依存はモック化**
- **テストデータはテスト内で明示的に定義**

### モックとスタブ

#### Vitest モック

```typescript
import { vi } from 'vitest'

// 関数のモック
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')

// モジュールのモック
vi.mock('@/lib/api-client', () => ({
  fetcher: vi.fn()
}))

// スパイ
const spy = vi.spyOn(object, 'method')
```

#### SWR モック

```typescript
import { SWRConfig } from 'swr'
import { render } from '@testing-library/react'

const mockData = { users: [{ id: 1, name: 'John' }] }

render(
  <SWRConfig value={{
    dedupingInterval: 0,
    provider: () => new Map([['/users', mockData]])
  }}>
    <UserList />
  </SWRConfig>
)
```

## コンポーネントテストの例

### 基本的なコンポーネントテスト

```typescript
// frontend/src/components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByText('Click me'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)

    expect(screen.getByText('Click me')).toBeDisabled()
  })
})
```

### データフェッチングコンポーネントのテスト

```typescript
// frontend/src/routes/user/index.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { describe, it, expect } from 'vitest'
import { UsersPage } from './index'

describe('UsersPage', () => {
  it('should render users list', async () => {
    const mockUsers = [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' },
    ]

    render(
      <SWRConfig value={{
        provider: () => new Map([['/users', mockUsers]])
      }}>
        <UsersPage />
      </SWRConfig>
    )

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('Jane')).toBeInTheDocument()
    })
  })

  it('should show loading state', () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <UsersPage />
      </SWRConfig>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
```

## フックテストの例

```typescript
// frontend/src/hooks/usePaginationState.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { usePaginationState } from './usePaginationState'

describe('usePaginationState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePaginationState())

    expect(result.current.page).toBe(1)
    expect(result.current.pageSize).toBe(10)
  })

  it('should update page', () => {
    const { result } = renderHook(() => usePaginationState())

    act(() => {
      result.current.setPage(2)
    })

    expect(result.current.page).toBe(2)
  })
})
```

## API テストの例（Hono）

```typescript
// backend/src/presentation/user.api.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { testClient } from 'hono/testing'
import app from '../index'

const client = testClient(app)

describe('User API', () => {
  beforeEach(async () => {
    // テストデータのセットアップ
  })

  describe('GET /api/users', () => {
    it('should return users list', async () => {
      const res = await client.api.users.$get()

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should support pagination', async () => {
      const res = await client.api.users.$get({
        query: { _page: '1', _limit: '10' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.length).toBeLessThanOrEqual(10)
    })
  })

  describe('POST /api/users', () => {
    it('should create new user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@example.com'
      }

      const res = await client.api.users.$post({
        json: newUser
      })

      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data).toHaveProperty('id')
      expect(data.name).toBe(newUser.name)
    })

    it('should return 400 with invalid data', async () => {
      const invalidUser = { name: '' }

      const res = await client.api.users.$post({
        json: invalidUser
      })

      expect(res.status).toBe(400)
    })
  })
})
```

## E2E テストの例（Playwright）

```typescript
// frontend/e2e/users.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Users Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users')
  })

  test('should display users list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Users')
    await expect(page.locator('table')).toBeVisible()
  })

  test('should filter users by search', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'John')
    await expect(page.locator('table tbody tr')).toHaveCount(1)
  })

  test('should navigate between pages', async ({ page }) => {
    await page.click('button:has-text("Next")')
    await expect(page.url()).toContain('page=2')
  })

  test('should open user detail', async ({ page }) => {
    await page.click('table tbody tr:first-child')
    await expect(page.url()).toContain('/users/')
    await expect(page.locator('h1')).toContainText('User Details')
  })
})
```

## CI/CD でのテスト実行

### プルリクエスト時

pnpm workspace を使用しているため、ルートで一度インストールするだけで全パッケージの依存関係がインストールされます。

```yaml
# .github/workflows/test.yml
name: Test

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      # ワークスペース全体の依存関係をインストール
      - name: Install dependencies
        run: pnpm install

      # 全パッケージでリント、型チェック、テストを実行
      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Build
        run: pnpm build

      - name: Test with coverage
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## テストのデバッグ

### Vitest UI モード

```bash
# UI モードでテストを実行（個別のパッケージで）
cd frontend && pnpm test:ui
cd backend && pnpm test:ui
```

### ブレークポイントデバッグ

```typescript
import { describe, it } from 'vitest'

describe('Debug test', () => {
  it('should debug', () => {
    debugger  // ブレークポイント

    // または
    console.log('Debug output')
  })
})
```

### Playwright デバッグモード

```bash
# UI モードで E2E テスト
cd frontend && pnpm test:e2e:ui

# デバッグモード
cd frontend && pnpm playwright test --debug
```

## トラブルシューティング

### よくある問題と対処法

#### テストがランダムに失敗する

- テスト間の依存関係を確認
- `beforeEach` でテストデータをリセット
- 非同期処理は `waitFor` で適切に待機
- SWR キャッシュをテストごとにクリア

#### テストが遅い

- 不要な `waitFor` を削減
- モックの活用を検討
- E2E テストは並列実行を設定
- データベース操作はトランザクションでロールバック

#### カバレッジが上がらない

- エッジケースのテストを追加
- エラー処理のテストを追加
- 条件分岐をすべてカバー
- 型定義ファイルはカバレッジから除外

#### モックが動作しない

- `vi.mock()` の配置場所を確認（ファイルの先頭）
- モックのリセット (`vi.clearAllMocks()`) を確認
- SWR のキャッシュクリアを確認
- ファクトリー関数の戻り値を確認

## パフォーマンステスト

### バンドルサイズ監視

```bash
cd frontend && pnpm build
# 出力されるバンドルサイズを確認
```

### Lighthouse CI

```bash
# Lighthouse でパフォーマンス測定
npx lighthouse http://localhost:5173 --view
```

## テストのメンテナンス

### 定期的な見直し

- 不安定なテストの修正または削除
- テストの実行時間最適化
- 重複するテストの統合
- 古いスナップショットの更新

### テストドキュメント

- 複雑なテストロジックにはコメントを追加
- テストシナリオの意図を明確に記載
- 特殊な設定が必要な場合は README に記載
