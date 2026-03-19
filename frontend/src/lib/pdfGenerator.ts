/**
 * PDF Generation Utilities
 * Provides helper functions for generating PDF documents using jsPDF
 */

import { jsPDF } from "jspdf";

export interface PdfOptions {
  orientation?: "portrait" | "landscape";
  unit?: "mm" | "pt" | "px" | "in";
  format?: string | number[];
  compress?: boolean;
}

export interface TextOptions {
  x: number;
  y: number;
  fontSize?: number;
  fontStyle?: "normal" | "bold" | "italic" | "bolditalic";
  align?: "left" | "center" | "right" | "justify";
  maxWidth?: number;
}

export interface TableColumn {
  header: string;
  key: string;
  width?: number;
}

export interface TableOptions {
  startX?: number;
  startY?: number;
  headerColor?: string;
  rowHeight?: number;
  fontSize?: number;
}

/**
 * Create a new PDF document
 */
export function createPdf(options: PdfOptions = {}): jsPDF {
  const { orientation = "portrait", unit = "mm", format = "a4", compress = true } = options;

  return new jsPDF({
    orientation,
    unit,
    format,
    compress,
  });
}

/**
 * Add text to PDF document
 */
export function addText(pdf: jsPDF, text: string, options: TextOptions): jsPDF {
  const { x, y, fontSize = 12, fontStyle = "normal", align = "left", maxWidth } = options;

  pdf.setFontSize(fontSize);
  pdf.setFont("helvetica", fontStyle);

  if (maxWidth) {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y, { align });
  } else {
    pdf.text(text, x, y, { align });
  }

  return pdf;
}

/**
 * Add a simple table to PDF document
 */
export function addTable<T extends Record<string, unknown>>(
  pdf: jsPDF,
  data: T[],
  columns: TableColumn[],
  options: TableOptions = {}
): jsPDF {
  const {
    startX = 10,
    startY = 10,
    headerColor = "#f0f0f0",
    rowHeight = 10,
    fontSize = 10,
  } = options;

  let currentY = startY;

  // Calculate column widths
  const pageWidth = pdf.internal.pageSize.getWidth();
  const totalWidth = pageWidth - startX * 2;
  const columnWidths = columns.map((col) => col.width || totalWidth / columns.length);

  // Draw header
  pdf.setFillColor(headerColor);
  pdf.rect(startX, currentY, totalWidth, rowHeight, "F");

  pdf.setFontSize(fontSize);
  pdf.setFont("helvetica", "bold");

  let currentX = startX;
  columns.forEach((col, index) => {
    pdf.text(col.header, currentX + 2, currentY + rowHeight / 2 + 2);
    currentX += columnWidths[index] || 0;
  });

  currentY += rowHeight;

  // Draw rows
  pdf.setFont("helvetica", "normal");

  data.forEach((row) => {
    currentX = startX;

    columns.forEach((col, index) => {
      const value = String(row[col.key] ?? "");
      const colWidth = columnWidths[index] || 0;
      const lines = pdf.splitTextToSize(value, colWidth - 4);

      lines.forEach((line: string, lineIndex: number) => {
        if (lineIndex === 0) {
          pdf.text(line, currentX + 2, currentY + rowHeight / 2 + 2);
        } else {
          currentY += rowHeight;
          pdf.text(line, currentX + 2, currentY + rowHeight / 2 + 2);
        }
      });

      currentX += colWidth;
    });

    // Draw row border
    pdf.rect(startX, currentY, totalWidth, rowHeight, "S");
    currentY += rowHeight;

    // Add new page if needed
    if (currentY > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      currentY = startY;
    }
  });

  return pdf;
}

/**
 * Add a line break
 */
export function addLineBreak(_pdf: jsPDF, height: number = 10): number {
  return height;
}

/**
 * Add a horizontal line
 */
export function addHorizontalLine(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  lineWidth: number = 0.5
): jsPDF {
  pdf.setLineWidth(lineWidth);
  pdf.line(x, y, x + width, y);
  return pdf;
}

/**
 * Save PDF to file
 */
export function savePdf(pdf: jsPDF, filename: string): void {
  pdf.save(filename);
}

/**
 * Get PDF as blob
 */
export function getPdfBlob(pdf: jsPDF): Blob {
  return pdf.output("blob");
}

/**
 * Get PDF as data URL
 */
export function getPdfDataUrl(pdf: jsPDF): string {
  return pdf.output("dataurlstring");
}

/**
 * Example: Generate a simple report PDF
 */
export function generateReportPdf<T extends Record<string, unknown>>(
  title: string,
  data: T[],
  columns: TableColumn[],
  filename: string
): void {
  const pdf = createPdf();

  // Add title
  addText(pdf, title, {
    x: pdf.internal.pageSize.getWidth() / 2,
    y: 20,
    fontSize: 18,
    fontStyle: "bold",
    align: "center",
  });

  // Add generation date
  const dateStr = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  addText(pdf, `作成日: ${dateStr}`, {
    x: pdf.internal.pageSize.getWidth() / 2,
    y: 30,
    fontSize: 10,
    align: "center",
  });

  // Add table
  addTable(pdf, data, columns, {
    startY: 40,
  });

  // Save PDF
  savePdf(pdf, filename);
}
