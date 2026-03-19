# PDF Generator Utilities

`jsPDF`を使用したPDF生成ユーティリティです。テーブルやテキストを含むPDFドキュメントを簡単に作成できます。

## インストール

```bash
pnpm add jspdf
```

## 基本的な使い方

### シンプルなPDFの生成

```typescript
import { createPdf, addText, savePdf } from "@/lib/pdfGenerator"

const pdf = createPdf()

addText(pdf, "Hello, World!", {
  x: 20,
  y: 20,
  fontSize: 20,
  fontStyle: "bold",
})

savePdf(pdf, "document.pdf")
```

### テーブルを含むPDFの生成

```typescript
import { createPdf, addText, addTable, savePdf } from "@/lib/pdfGenerator"
import type { TableColumn } from "@/lib/pdfGenerator"

interface User extends Record<string, unknown> {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
]

const columns: TableColumn[] = [
  { header: "ID", key: "id", width: 20 },
  { header: "名前", key: "name", width: 60 },
  { header: "メール", key: "email", width: 80 },
]

const pdf = createPdf()

addText(pdf, "ユーザー一覧", {
  x: pdf.internal.pageSize.getWidth() / 2,
  y: 20,
  fontSize: 18,
  fontStyle: "bold",
  align: "center",
})

addTable(pdf, users, columns, {
  startY: 35,
})

savePdf(pdf, "users.pdf")
```

### レポートPDFの生成（ヘルパー関数を使用）

```typescript
import { generateReportPdf } from "@/lib/pdfGenerator"
import type { TableColumn } from "@/lib/pdfGenerator"

interface SalesData extends Record<string, unknown> {
  date: string
  product: string
  amount: number
}

const salesData: SalesData[] = [
  { date: "2026-02-01", product: "商品A", amount: 10000 },
  { date: "2026-02-02", product: "商品B", amount: 15000 },
]

const columns: TableColumn[] = [
  { header: "日付", key: "date", width: 40 },
  { header: "商品名", key: "product", width: 60 },
  { header: "金額", key: "amount", width: 40 },
]

generateReportPdf("売上レポート", salesData, columns, "sales-report.pdf")
```

## API リファレンス

### `createPdf(options?)`

新しいPDFドキュメントを作成します。

**パラメータ:**
- `options.orientation` - ページの向き (`"portrait"` | `"landscape"`)
- `options.unit` - 単位 (`"mm"` | `"pt"` | `"px"` | `"in"`)
- `options.format` - ページサイズ (デフォルト: `"a4"`)
- `options.compress` - 圧縮の有効化 (デフォルト: `true`)

### `addText(pdf, text, options)`

PDFにテキストを追加します。

**パラメータ:**
- `pdf` - jsPDFインスタンス
- `text` - 追加するテキスト
- `options.x` - X座標
- `options.y` - Y座標
- `options.fontSize` - フォントサイズ (デフォルト: 12)
- `options.fontStyle` - フォントスタイル (`"normal"` | `"bold"` | `"italic"` | `"bolditalic"`)
- `options.align` - テキストの配置 (`"left"` | `"center"` | `"right"` | `"justify"`)
- `options.maxWidth` - 最大幅（指定した場合、自動的に折り返されます）

### `addTable(pdf, data, columns, options?)`

PDFにテーブルを追加します。

**パラメータ:**
- `pdf` - jsPDFインスタンス
- `data` - テーブルデータの配列
- `columns` - カラム定義の配列
  - `header` - ヘッダーテキスト
  - `key` - データのキー
  - `width` - カラムの幅（オプション）
- `options.startX` - 開始X座標 (デフォルト: 10)
- `options.startY` - 開始Y座標 (デフォルト: 10)
- `options.headerColor` - ヘッダーの背景色 (デフォルト: `"#f0f0f0"`)
- `options.rowHeight` - 行の高さ (デフォルト: 10)
- `options.fontSize` - フォントサイズ (デフォルト: 10)

### `addHorizontalLine(pdf, x, y, width, lineWidth?)`

水平線を追加します。

**パラメータ:**
- `pdf` - jsPDFインスタンス
- `x` - 開始X座標
- `y` - Y座標
- `width` - 線の幅
- `lineWidth` - 線の太さ (デフォルト: 0.5)

### `savePdf(pdf, filename)`

PDFをファイルとして保存します。

### `getPdfBlob(pdf)`

PDFをBlobとして取得します。

### `getPdfDataUrl(pdf)`

PDFをData URLとして取得します。

### `generateReportPdf(title, data, columns, filename)`

レポートPDFを生成するヘルパー関数。タイトル、作成日、テーブルを含むPDFを自動生成します。

## Reactコンポーネントでの使用例

```typescript
import { Button } from "@/components/ui/Button"
import { exportTableDataToPdf } from "@/lib/pdfGenerator.example"
import type { TableColumn } from "@/lib/pdfGenerator"

interface User extends Record<string, unknown> {
  id: number
  name: string
  email: string
}

export function UserTable({ users }: { users: User[] }) {
  const columns: TableColumn[] = [
    { header: "ID", key: "id", width: 20 },
    { header: "名前", key: "name", width: 60 },
    { header: "メール", key: "email", width: 80 },
  ]

  const handleExportPdf = () => {
    exportTableDataToPdf("ユーザー一覧", users, columns)
  }

  return (
    <div>
      <Button onClick={handleExportPdf}>PDFエクスポート</Button>
      {/* テーブルのレンダリング */}
    </div>
  )
}
```

## 注意事項

- jsPDFは日本語フォントをデフォルトでサポートしていません。日本語を使用する場合は、カスタムフォントを追加する必要があります。
- 大量のデータを扱う場合は、ページの自動追加機能が実装されていますが、パフォーマンスに注意してください。
- テーブルのセルに長いテキストがある場合、自動的に折り返されますが、レイアウトが崩れる可能性があります。

## 詳細な使用例

詳細な使用例は `pdfGenerator.example.ts` を参照してください。

- シンプルなPDF
- テーブル付きPDF
- カスタムスタイリング
- レポート生成
- Reactコンポーネントからのエクスポート

## ライセンス

このユーティリティは jsPDF (MIT License) を使用しています。
