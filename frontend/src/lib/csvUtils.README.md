# CSV Utilities

CSVのエクスポートとインポートを簡単に行うためのユーティリティです。

## 機能

- ✅ オブジェクト配列からCSV文字列への変換
- ✅ CSVファイルのダウンロード（Excel互換のBOM付き）
- ✅ CSV文字列からオブジェクト配列へのパース
- ✅ カンマ、改行、引用符を含む値のエスケープ処理
- ✅ ファイルの読み込み（UTF-8 BOM対応）

## 基本的な使い方

### CSVエクスポート

```typescript
import { convertToCSV, downloadCSV } from "@/lib/csvUtils"

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

// CSV文字列に変換
const csvContent = convertToCSV(users, columns)

// ファイルとしてダウンロード
downloadCSV(csvContent, "users.csv")
```

### CSVインポート

```typescript
import { parseCSV, readFileAsText } from "@/lib/csvUtils"

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
    // ファイルをテキストとして読み込み
    const text = await readFileAsText(file)

    // CSVをパース
    const users = parseCSV<User>(text, columns)

    console.log(users)
  } catch (error) {
    console.error("CSVの解析に失敗しました:", error)
  }
}
```

## API リファレンス

### `convertToCSV<T>(data, columns)`

オブジェクト配列をCSV文字列に変換します。

**パラメータ:**
- `data: T[]` - 変換するデータの配列
- `columns: { key: keyof T; header: string }[]` - カラム定義

**戻り値:** CSV形式の文字列

**特徴:**
- カンマ、改行、引用符を含む値は自動的にエスケープされます
- ヘッダー行が自動的に追加されます

### `downloadCSV(csvContent, filename)`

CSV文字列をファイルとしてダウンロードします。

**パラメータ:**
- `csvContent: string` - CSVの内容
- `filename: string` - ダウンロードするファイル名

**特徴:**
- UTF-8 BOMが自動的に追加され、Excelでの文字化けを防ぎます
- ブラウザのダウンロード機能を使用します

### `parseCSV<T>(csvContent, columns)`

CSV文字列をオブジェクト配列にパースします。

**パラメータ:**
- `csvContent: string` - パースするCSV文字列
- `columns: { key: keyof T; header: string }[]` - 期待されるカラム定義

**戻り値:** パースされたオブジェクトの配列

**エラー:**
- ヘッダーが期待される形式と一致しない場合、エラーをスローします

**特徴:**
- 引用符で囲まれた値を正しく処理します
- エスケープされた引用符を処理します

### `readFileAsText(file)`

Fileオブジェクトをテキストとして読み込みます。

**パラメータ:**
- `file: File` - 読み込むファイル

**戻り値:** `Promise<string>` - ファイルの内容

**特徴:**
- UTF-8エンコーディングで読み込みます
- BOMが存在する場合は自動的に削除します

## Reactコンポーネントでの使用例

### エクスポートボタン

```typescript
import { Button } from "@/components/ui/Button"
import { convertToCSV, downloadCSV } from "@/lib/csvUtils"
import { Download } from "lucide-react"

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

    const csvContent = convertToCSV(users, columns)
    const timestamp = new Date().toISOString().slice(0, 10)
    downloadCSV(csvContent, `users_${timestamp}.csv`)
  }

  return (
    <Button onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      CSVエクスポート
    </Button>
  )
}
```

### インポートフォーム

```typescript
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { parseCSV, readFileAsText } from "@/lib/csvUtils"
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
      const text = await readFileAsText(file)
      const users = parseCSV<User>(text, [
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
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <Button onClick={handleImport} disabled={!file}>
        <Upload className="h-4 w-4 mr-2" />
        インポート
      </Button>
    </div>
  )
}
```

## 注意事項

- CSVファイルはUTF-8エンコーディングで保存してください
- Excelで開く場合、BOMが自動的に付与されるため文字化けしません
- カラムのヘッダー名は厳密に一致する必要があります
- 大量のデータを扱う場合は、パフォーマンスに注意してください

## 実装例

このユーティリティを使用した完全な実装例:
- `/routes/admin/users/components/ExportUsersDialog.tsx` - エクスポートダイアログ
- `/routes/admin/users/components/ImportUsersDialog.tsx` - インポートダイアログ
