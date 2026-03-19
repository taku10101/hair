/**
 * Date formatting utilities for consistent date display across the application.
 */

/**
 * Formats a date as a Japanese locale date string (YYYY/MM/DD).
 *
 * @param date - Date to format (string or Date object)
 * @returns Formatted date string in Japanese locale (e.g., "2024/01/15")
 *
 * @example
 * formatJapaneseDate("2024-01-15T10:30:00Z") // "2024/1/15"
 * formatJapaneseDate(new Date()) // "2024/1/15"
 */
export function formatJapaneseDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
}

/**
 * Formats a date as a Japanese locale date and time string.
 *
 * @param date - Date to format (string or Date object)
 * @returns Formatted date and time string in Japanese locale
 *
 * @example
 * formatJapaneseDateTime("2024-01-15T10:30:00Z") // "2024/1/15 10:30:00"
 * formatJapaneseDateTime(new Date()) // "2024/1/15 10:30:00"
 */
export function formatJapaneseDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}
