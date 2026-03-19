/**
 * Common API types and interfaces
 */

/**
 * Pagination response from json-server
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

/**
 * Common query parameters for json-server
 */
export interface QueryParams {
  // ページネーション
  _page?: number;
  _limit?: number;

  // ソート
  _sort?: string;
  _order?: "asc" | "desc";

  // 全文検索
  q?: string;

  // カスタムフィルター（必要に応じて追加）
  [key: string]: string | number | boolean | string[] | undefined;
}
