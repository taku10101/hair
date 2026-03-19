# Excel Utilities

Excelファイルのエクスポートとインポートを簡単に行うためのユーティリティです。xlsx形式をサポートし、日本語にも完全対応しています。

## 機能

- ✅ オブジェクト配列からExcelファイルへの変換
- ✅ Excelファイルのダウンロード（.xlsx形式）
- ✅ Excelファイルからオブジェクト配列へのパース
- ✅ 自動列幅調整
- ✅ 日本語完全対応
- ✅ 型安全なTypeScript実装

## 基本的な使い方

### Excelエクスポート

```typescript
import { downloadExcel } from "@/lib/excelUtils"

interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: "山田太郎", email: "yamada@example.com" },
  { id: 2, name: "佐藤花子", email: "sato@example.com" },
]

const columns = [
  { key: "id" as const, header: "ID" },
  { key: "name" as const, header: "名前" },
  { key: "email" as const, header: "メールアドレス" },
]

// Excelファイルをダウンロード
downloadExcel(users, columns, "users.xlsx")
```

### Excelインポート

```typescript
import { parseExcel } from "@/lib/excelUtils"

interface User {
  id: number
  name: string
  email: string
}

const columns = [
  { key: "id" as const, header: "ID" },
  { key: "name" as const, header: "名前" },
  { key: "email" as const, header: "メールアドレス" },
]

// ファイル入力から読み込み
const handleFileUpload = async (file: File) => {
  try {
    // Excelファイルをパース
    const users = await parseExcel<User>(file, columns)
    console.log(users)
  } catch (error) {
    console.error("Excelの解析に失敗しました:", error)
  }
}
```

## API リファレンス

### `downloadExcel<T>(data, columns, filename)`

オブジェクト配列をExcelファイルとしてダウンロードします。

**パラメータ:**
- `data: T[]` - エクスポートするデータの配列
- `columns: { key: keyof T; header: string }[]` - カラム定義
- `filename: string` - ダウンロードするファイル名（.xlsx拡張子を含む）

**特徴:**
- ヘッダー行が自動的に追加されます
- 列幅が内容に応じて自動調整されます（最大50文字幅）
- 日本語を含む文字も正しく表示されます

### `parseExcel<T>(file, columns)`

Excelファイルをオブジェクト配列にパースします。

**パラメータ:**
- `file: File` - パースするExcelファイル
- `columns: { key: keyof T; header: string }[]` - 期待されるカラム定義

**戻り値:** `Promise<T[]>` - パースされたオブジェクトの配列

**エラー:**
- ヘッダーが期待される形式と一致しない場合、エラーをスローします
- ファイルの読み込みに失敗した場合、エラーをスローします

**特徴:**
- 最初のシートを自動的に読み込みます
- ヘッダー行を検証します
- 空のセルは空文字列として扱われます

## Reactコンポーネントでの使用例

### エクスポートボタン

```typescript
import { Button } from "@/components/ui/Button"
import { downloadExcel } from "@/lib/excelUtils"
import { FileSpreadsheet } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
}

export function UserExportButton({ users }: { users: User[] }) {
  const handleExport = () => {
    const columns = [
      { key: "id" as const, header: "ID" },
      { key: "name" as const, header: "名前" },
      { key: "email" as const, header: "メールアドレス" },
    ]

    const timestamp = new Date().toISOString().slice(0, 10)
    downloadExcel(users, columns, `users_${timestamp}.xlsx`)
  }

  return (
    <Button onClick={handleExport}>
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Excelエクスポート
    </Button>
  )
}
```

### インポートフォーム

```typescript
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { parseExcel } from "@/lib/excelUtils"
import { Upload } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
}

export function UserImportForm() {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null)
  }

  const handleImport = async () => {
    if (!file) return

    try {
      const users = await parseExcel<User>(file, [
        { key: "id", header: "ID" },
        { key: "name", header: "名前" },
        { key: "email", header: "メールアドレス" },
      ])

      console.log("インポートされたユーザー:", users)
      // API呼び出しなどの処理
    } catch (error) {
      console.error("インポートエラー:", error)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
      />
      <Button onClick={handleImport} disabled={!file}>
        <Upload className="h-4 w-4 mr-2" />
        インポート
      </Button>
    </div>
  )
}
```

## CSVとの比較

| 機能 | Excel (.xlsx) | CSV (.csv) |
|------|---------------|------------|
| 日本語サポート | ✅ 完全対応 | ✅ BOMで対応 |
| 複数シート | ✅ サポート | ❌ 非対応 |
| 書式設定 | ✅ 可能 | ❌ 不可 |
| ファイルサイズ | やや大きい | 小さい |
| 互換性 | Excel専用 | 汎用的 |
| 列幅自動調整 | ✅ 対応 | ❌ 非対応 |

## 使い分けガイド

### Excelを使用する場合
- Excelで直接開くことが想定される
- 列幅を自動調整したい
- 将来的に書式設定を追加する可能性がある
- 複数シートを扱う可能性がある

### CSVを使用する場合
- ファイルサイズを最小限に抑えたい
- 他のシステムとの連携が必要
- テキストエディタで直接編集する可能性がある
- 軽量なデータ交換が目的

## 注意事項

- Excelファイルは.xlsx形式（Office 2007以降）です
- 最初のシートのみがインポート対象です
- ヘッダー名は厳密に一致する必要があります
- 大量のデータを扱う場合は、ブラウザのメモリ制限に注意してください

## 実装例

このユーティリティを使用した完全な実装例:
- `/components/export/ExportButton.tsx` - Excel/CSV統合エクスポートボタン
- `/routes/admin/users/index.tsx` - 管理画面での使用例
