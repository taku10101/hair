/**
 * Excel Utilities
 * Provides helper functions for Excel export using xlsx library
 */
import * as XLSX from "xlsx";

/**
 * Convert array of objects to Excel file and download
 */
export function downloadExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[],
  filename: string
): void {
  // Create worksheet data with headers
  const worksheetData: unknown[][] = [
    columns.map((col) => col.header),
    ...data.map((row) => columns.map((col) => row[col.key] ?? "")),
  ];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const columnWidths = columns.map((col) => {
    const maxLength = Math.max(
      col.header.length,
      ...data.map((row) => String(row[col.key] ?? "").length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  worksheet["!cols"] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Download
  XLSX.writeFile(workbook, filename);
}

/**
 * Parse Excel file to array of objects
 */
export function parseExcel<T>(
  file: File,
  columns: { key: keyof T; header: string }[]
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get first worksheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error("Excelファイルにシートが見つかりません"));
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) {
          reject(new Error("ワークシートの読み込みに失敗しました"));
          return;
        }

        // Convert to array of arrays
        const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          defval: "",
        });

        if (rawData.length === 0) {
          resolve([]);
          return;
        }

        // Validate headers
        const headers = rawData[0] as string[];
        const expectedHeaders = columns.map((col) => col.header);
        const headersMatch = expectedHeaders.every((header) => headers.includes(header));

        if (!headersMatch) {
          reject(
            new Error(
              `Excelヘッダーが一致しません。期待されるヘッダー: ${expectedHeaders.join(", ")}`
            )
          );
          return;
        }

        // Parse data rows
        const result: T[] = [];
        for (let i = 1; i < rawData.length; i++) {
          const values = rawData[i] as unknown[];
          const row: Record<string, unknown> = {};

          columns.forEach((col) => {
            const headerIndex = headers.indexOf(col.header);
            if (headerIndex !== -1) {
              row[col.key as string] = values[headerIndex] ?? "";
            }
          });

          result.push(row as T);
        }

        resolve(result);
      } catch (error) {
        reject(new Error(`Excelファイルの解析に失敗しました: ${error}`));
      }
    };

    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
    reader.readAsArrayBuffer(file);
  });
}
