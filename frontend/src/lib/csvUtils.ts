/**
 * CSV Utilities
 * Provides helper functions for CSV export and import
 */

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  // Create header row
  const headers = columns.map((col) => col.header).join(",");

  // Create data rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        // Escape values containing commas, quotes, or newlines
        if (
          value &&
          typeof value === "string" &&
          (value.includes(",") || value.includes('"') || value.includes("\n"))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value?.toString() ?? "";
      })
      .join(",")
  );

  return [headers, ...rows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for Excel compatibility with UTF-8
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV<T>(csvContent: string, columns: { key: keyof T; header: string }[]): T[] {
  const lines = csvContent.split("\n").filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  // Parse header
  const headers = parseCSVLine(lines[0] || "");

  // Validate headers
  const expectedHeaders = columns.map((col) => col.header);
  const headersMatch = expectedHeaders.every((header) => headers.includes(header));
  if (!headersMatch) {
    throw new Error(`CSVヘッダーが一致しません。期待されるヘッダー: ${expectedHeaders.join(", ")}`);
  }

  // Parse data rows
  const data: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i] || "");
    const row: Record<string, unknown> = {};

    columns.forEach((col) => {
      const headerIndex = headers.indexOf(col.header);
      if (headerIndex !== -1) {
        row[col.key as string] = values[headerIndex] || "";
      }
    });

    data.push(row as T);
  }

  return data;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Remove BOM if present
      resolve(text.replace(/^\uFEFF/, ""));
    };
    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
    reader.readAsText(file, "UTF-8");
  });
}
