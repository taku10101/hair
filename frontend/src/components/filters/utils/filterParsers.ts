import { parseAsArrayOf, parseAsInteger, parseAsIsoDateTime, parseAsString } from "nuqs";
import type { FilterConfig } from "../types";

/**
 * フィルター設定からクエリ状態パーサーを構築
 *
 * 注: nuqsパーサーの型は複雑でフィルタータイプによって異なるため、
 * ここではeslint-disableを使用しています。実際の型安全性は
 * フィルター設定レベルで強制され、ランタイム動作は正しいです。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildQueryParsers(filters: FilterConfig[]): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return filters.reduce<Record<string, any>>((acc, filter) => {
    switch (filter.type) {
      case "search":
        acc[filter.paramName] = parseAsString.withDefault("");
        break;
      case "select":
        acc[filter.paramName] = parseAsString.withDefault(filter.defaultValue || "");
        break;
      case "multi-select":
        acc[filter.paramName] = parseAsArrayOf(parseAsString).withDefault([]);
        break;
      case "date":
        acc[filter.paramName] = parseAsIsoDateTime;
        break;
      case "date-range":
        acc[filter.fromParamName] = parseAsIsoDateTime;
        acc[filter.toParamName] = parseAsIsoDateTime;
        break;
      case "number-range":
        acc[filter.minParamName] = parseAsInteger;
        acc[filter.maxParamName] = parseAsInteger;
        break;
    }
    return acc;
  }, {});
}
