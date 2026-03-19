/**
 * PDF Generator Usage Examples
 * This file demonstrates how to use the pdfGenerator utilities
 */

import {
  addHorizontalLine,
  addTable,
  addText,
  createPdf,
  generateReportPdf,
  savePdf,
  type TableColumn,
} from "./pdfGenerator";

// Example 1: Simple PDF with text
export function generateSimplePdf() {
  const pdf = createPdf();

  addText(pdf, "Hello, World!", {
    x: 20,
    y: 20,
    fontSize: 20,
    fontStyle: "bold",
  });

  addText(pdf, "This is a simple PDF document created with jsPDF.", {
    x: 20,
    y: 35,
    fontSize: 12,
  });

  savePdf(pdf, "simple-document.pdf");
}

// Example 2: PDF with table
export function generateUserListPdf() {
  interface User extends Record<string, unknown> {
    id: number;
    name: string;
    email: string;
    role: string;
  }

  const users: User[] = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" },
  ];

  const columns: TableColumn[] = [
    { header: "ID", key: "id", width: 20 },
    { header: "名前", key: "name", width: 50 },
    { header: "メールアドレス", key: "email", width: 70 },
    { header: "役割", key: "role", width: 40 },
  ];

  const pdf = createPdf();

  addText(pdf, "ユーザー一覧", {
    x: pdf.internal.pageSize.getWidth() / 2,
    y: 20,
    fontSize: 18,
    fontStyle: "bold",
    align: "center",
  });

  addHorizontalLine(pdf, 20, 25, pdf.internal.pageSize.getWidth() - 40);

  addTable(pdf, users, columns, {
    startY: 35,
  });

  savePdf(pdf, "user-list.pdf");
}

// Example 3: Using the generateReportPdf helper
export function generateSalesReport() {
  interface SalesData extends Record<string, unknown> {
    date: string;
    product: string;
    quantity: number;
    amount: number;
  }

  const salesData: SalesData[] = [
    { date: "2026-02-01", product: "商品A", quantity: 10, amount: 10000 },
    { date: "2026-02-02", product: "商品B", quantity: 5, amount: 15000 },
    { date: "2026-02-03", product: "商品A", quantity: 8, amount: 8000 },
  ];

  const columns: TableColumn[] = [
    { header: "日付", key: "date", width: 40 },
    { header: "商品名", key: "product", width: 60 },
    { header: "数量", key: "quantity", width: 30 },
    { header: "金額", key: "amount", width: 40 },
  ];

  generateReportPdf("売上レポート", salesData, columns, "sales-report.pdf");
}

// Example 4: Custom styled PDF
export function generateCustomStyledPdf() {
  const pdf = createPdf({ orientation: "landscape" });

  // Title
  addText(pdf, "カスタムスタイルのPDF", {
    x: pdf.internal.pageSize.getWidth() / 2,
    y: 20,
    fontSize: 24,
    fontStyle: "bold",
    align: "center",
  });

  // Subtitle
  addText(pdf, "様々なテキストスタイルのデモンストレーション", {
    x: pdf.internal.pageSize.getWidth() / 2,
    y: 35,
    fontSize: 14,
    fontStyle: "italic",
    align: "center",
  });

  addHorizontalLine(pdf, 20, 40, pdf.internal.pageSize.getWidth() - 40, 1);

  // Section 1
  addText(pdf, "セクション 1: 通常のテキスト", {
    x: 20,
    y: 55,
    fontSize: 14,
    fontStyle: "bold",
  });

  addText(pdf, "これは通常のテキストです。長いテキストは自動的に折り返されます。", {
    x: 20,
    y: 65,
    fontSize: 12,
    maxWidth: pdf.internal.pageSize.getWidth() - 40,
  });

  // Section 2
  addText(pdf, "セクション 2: 右寄せテキスト", {
    x: 20,
    y: 85,
    fontSize: 14,
    fontStyle: "bold",
  });

  addText(pdf, "このテキストは右寄せです", {
    x: pdf.internal.pageSize.getWidth() - 20,
    y: 95,
    fontSize: 12,
    align: "right",
  });

  // Section 3
  addText(pdf, "セクション 3: 中央寄せテキスト", {
    x: 20,
    y: 115,
    fontSize: 14,
    fontStyle: "bold",
  });

  addText(pdf, "このテキストは中央寄せです", {
    x: pdf.internal.pageSize.getWidth() / 2,
    y: 125,
    fontSize: 12,
    align: "center",
  });

  savePdf(pdf, "custom-styled.pdf");
}

// Example 5: Export data from React component
export function exportTableDataToPdf<T extends Record<string, unknown>>(
  title: string,
  data: T[],
  columns: TableColumn[]
) {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `${title}_${timestamp}.pdf`;

  generateReportPdf(title, data, columns, filename);
}
