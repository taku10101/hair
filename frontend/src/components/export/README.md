# Export Component (Excel & CSV)

データをExcel (.xlsx) またはCSV (.csv) 形式でエクスポートする統合コンポーネントです。フィルター済みのデータを自動的にエクスポートできます。

## 特徴

- ✅ **複数形式対応**: ExcelとCSVの両方をサポート
- ✅ **フィルター連携**: フィルター済みのデータを自動的にエクスポート
- ✅ **汎用性**: どのページでも簡単に使用可能
- ✅ **列選択**: エクスポートする列を自由に選択
- ✅ **タイムスタンプ**: ファイル名に自動的に日付を追加
- ✅ **日本語対応**: Excel、CSV共に日本語完全対応
- ✅ **型安全**: TypeScriptで完全に型付け

## スタンドアロンでの使用方法（推奨）

最新の`ExportButton`コンポーネントを使用すると、ExcelとCSVの両方に対応できます。

```tsx
import { ExportButton, type ExportColumn } from "@/components/export"
import type { User } from "@/types/user"

export function CustomPage() {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  const exportColumns: ExportColumn<User>[] = [
    { key: "id", header: "ID", enabled: true },
    { key: "name", header: "名前", enabled: true },
    { key: "email", header: "メールアドレス", enabled: true },
    { key: "role", header: "ロール", enabled: true },
    { key: "createdAt", header: "作成日", enabled: true },
    { key: "updatedAt", header: "更新日", enabled: false }, // デフォルトで非選択
  ]

  return (
    <div>
      <h1>ユーザー一覧</h1>

      {/* Excel/CSVエクスポート */}
      <ExportButton
        data={filteredUsers}
        columns={exportColumns}
        filename="users.xlsx"
        buttonText="エクスポート"
        buttonVariant="outline"
        buttonSize="sm"
      />

      {/* テーブルなど */}
    </div>
  )
}
```

### 動作

1. 「エクスポート」ボタンをクリックすると、ダイアログが開きます
2. **エクスポート形式を選択**（Excel または CSV）
3. **エクスポートする列を選択**
4. 「ダウンロード」ボタンをクリックすると、選択した形式でファイルがダウンロードされます
5. ファイル名は自動的に `users_20260209.xlsx` または `users_20260209.csv` のような形式になります

## 従来のCSV専用コンポーネント

CSV専用の`CsvExportButton`も引き続き使用可能です。

```tsx
import { CsvExportButton, type CsvExportColumn } from "@/components/export"
import type { User } from "@/types/user"

export function CustomPage() {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  const csvColumns: CsvExportColumn<User>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "名前" },
    { key: "email", header: "メールアドレス" },
  ]

  return (
    <div>
      <h1>ユーザー一覧</h1>

      {/* CSV専用エクスポート */}
      <CsvExportButton
        data={filteredUsers}
        columns={csvColumns}
        filename="users.csv"
        buttonText="CSVエクスポート"
        buttonVariant="outline"
        buttonSize="sm"
      />

      {/* テーブルなど */}
    </div>
  )
}
```

## ExportColumn の設定

```typescript
interface ExportColumn<T> {
  key: keyof T              // データのキー
  header: string            // ヘッダー名（Excel/CSV共通）
  enabled?: boolean         // デフォルトで選択するか（デフォルト: true）
}
```

### 例

```typescript
const columns: ExportColumn<User>[] = [
  { key: "id", header: "ID", enabled: true },           // デフォルトで選択
  { key: "name", header: "名前", enabled: true },       // デフォルトで選択
  { key: "email", header: "メールアドレス", enabled: true },
  { key: "password", header: "パスワード", enabled: false }, // デフォルトで非選択（機密情報）
]
```

## ExportButton のプロパティ

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|-----|-----------|------|
| `data` | `T[]` | ✅ | - | エクスポートするデータ |
| `columns` | `ExportColumn<T>[]` | ✅ | - | 列の定義 |
| `filename` | `string` | ✅ | - | ファイル名（例: "users.xlsx"） |
| `buttonText` | `string` | ❌ | "エクスポート" | ボタンのテキスト |
| `buttonVariant` | `"default" \| "outline" \| "ghost"` | ❌ | "outline" | ボタンのスタイル |
| `buttonSize` | `"default" \| "sm" \| "lg"` | ❌ | "sm" | ボタンのサイズ |

## 使用例

### 例1: 管理画面でのユーザーエクスポート

```tsx
import { ExportButton, type ExportColumn } from "@/components/export"
import type { DbUser } from "@/types/auth"

export function AdminUsersPage() {
  const { users, isLoading } = useUsers()

  const exportColumns: ExportColumn<DbUser>[] = [
    { key: "id", header: "ID", enabled: true },
    { key: "email", header: "メールアドレス", enabled: true },
    { key: "name", header: "名前", enabled: true },
    { key: "role", header: "ロール", enabled: true },
    { key: "emailVerified", header: "メール確認", enabled: true },
    { key: "firebaseUid", header: "Firebase UID", enabled: false },
    { key: "photoUrl", header: "写真URL", enabled: false },
    { key: "createdAt", header: "作成日", enabled: true },
    { key: "updatedAt", header: "更新日", enabled: false },
  ]

  return (
    <div>
      <div className="flex justify-between">
        <h1>ユーザー管理</h1>
        <ExportButton
          data={users}
          columns={exportColumns}
          filename="users.xlsx"
        />
      </div>
      {/* テーブルなど */}
    </div>
  )
}
```

### 例2: カスタムボタンテキスト

```tsx
<ExportButton
  data={products}
  columns={productColumns}
  filename="products.xlsx"
  buttonText="商品データをダウンロード"
  buttonVariant="default"
  buttonSize="default"
/>
```

### 例3: 複数のエクスポートボタン

```tsx
export function ReportsPage() {
  return (
    <div className="flex gap-2">
      <ExportButton
        data={dailyReport}
        columns={dailyColumns}
        filename="daily_report.xlsx"
        buttonText="日次レポート"
      />
      <ExportButton
        data={monthlyReport}
        columns={monthlyColumns}
        filename="monthly_report.xlsx"
        buttonText="月次レポート"
      />
    </div>
  )
}
```

## フィルターとの連携

フィルター済みのデータを`data`プロパティに渡すことで、フィルター結果のみをエクスポートできます。

```tsx
export function UsersPage() {
  const { users } = useUsers()
  const [filteredUsers, setFilteredUsers] = useState(users)

  return (
    <div>
      {/* フィルター */}
      <UserFilter data={users} onFilter={setFilteredUsers} />

      {/* エクスポート（フィルター済みデータ） */}
      <ExportButton
        data={filteredUsers}  // フィルター済みデータのみ
        columns={exportColumns}
        filename="users.xlsx"
      />

      {/* テーブル */}
      <UserTable data={filteredUsers} />
    </div>
  )
}
```

## ベストプラクティス

### 1. 機密情報は`enabled: false`に設定

```typescript
const columns: ExportColumn<User>[] = [
  { key: "id", header: "ID", enabled: true },
  { key: "name", header: "名前", enabled: true },
  { key: "password", header: "パスワード", enabled: false }, // 機密情報
  { key: "secretKey", header: "秘密鍵", enabled: false },    // 機密情報
]
```

### 2. わかりやすいヘッダー名を使用

```typescript
// ❌ 悪い例
{ key: "createdAt", header: "createdAt" }

// ✅ 良い例
{ key: "createdAt", header: "作成日" }
```

### 3. ファイル名は明確に（推奨: Excel形式）

```typescript
// ✅ 推奨（Excel）
filename: "users.xlsx"
filename: "sales_report.xlsx"

// ✅ CSV形式も可
filename: "users.csv"
```

### 4. Excelを推奨する理由

- 列幅が自動調整される
- 日本語の文字化けの心配がない
- Excelで直接開ける
- 将来的に書式設定を追加できる

## エクスポート形式の選択ガイド

### Excelを選択する場合（デフォルト推奨）
- ✅ Excelで直接開くことが想定される
- ✅ 列幅を自動調整したい
- ✅ 日本語が含まれる
- ✅ ビジネス用途のレポート

### CSVを選択する場合
- ✅ 他のシステムにインポートする
- ✅ プログラムで処理する
- ✅ ファイルサイズを最小限に抑えたい
- ✅ テキストエディタで編集する

## トラブルシューティング

### Excel形式でダウンロードできない

→ `xlsx`パッケージがインストールされているか確認してください: `pnpm add xlsx`

### CSVで文字化けする

→ CSV形式を選択した場合、自動的にUTF-8 BOMが付与されるため、通常は文字化けしません。それでも文字化けする場合は、Excel形式を使用することをお勧めします。

### フィルター済みデータがエクスポートされない

→ 手動でフィルター済みデータを`data`プロパティに渡す必要があります。

## コンポーネント一覧

### 推奨: ExportButton（新規）
- Excel/CSV両方に対応
- 形式選択UI付き
- `/components/export/ExportButton.tsx`

### 従来: CsvExportButton
- CSV専用
- シンプルなUI
- `/components/export/CsvExportButton.tsx`

## 関連ファイル

- `/components/export/ExportButton.tsx` - Excel/CSV統合エクスポートボタン
- `/components/export/CsvExportButton.tsx` - CSV専用エクスポートボタン
- `/lib/excelUtils.ts` - Excel変換ユーティリティ
- `/lib/csvUtils.ts` - CSV変換ユーティリティ
- `/routes/admin/users/index.tsx` - 実装例

## 関連ドキュメント

- [Excel Utilities README](/lib/excelUtils.README.md) - Excelエクスポート/インポートの詳細
- [CSV Utilities README](/lib/csvUtils.README.md) - CSVエクスポート/インポートの詳細
