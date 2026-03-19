import { useQueryStates } from "nuqs";
import { useMemo } from "react";
import type { FilterConfig } from "@/components/filters";
import { buildQueryParsers, filterTypeHandlers } from "@/lib/filterTypeHandlers";

/**
 * Client-side filtering hook based on filter configuration.
 *
 * This hook uses filterTypeHandlers to build parsers and apply filters,
 * making it easy to add new filter types without modifying this file.
 *
 * @example
 * ```tsx
 * const { filteredData, filterParams } = useClientSideFiltering({
 *   data: users,
 *   filters: filterConfigs,
 * })
 * ```
 */
export function useClientSideFiltering<T extends Record<string, any>>({
  data,
  filters,
}: {
  data: T[] | undefined;
  filters: FilterConfig[];
}) {
  // ハンドラーを使用してフィルター設定からクエリ状態パーサーを構築
  const queryParsers = useMemo(() => buildQueryParsers(filters), [filters]);

  const [filterParams] = useQueryStates(queryParsers);

  // ハンドラーを使用してデータにフィルターを適用
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((item) => {
      // アイテムがすべてのフィルターに一致するかチェック
      return filters.every((filter) => {
        const handler = filterTypeHandlers[filter.type];
        if (!handler) {
          return true;
        }
        return handler.matches(item, filterParams, filter);
      });
    });
  }, [data, filters, filterParams]);

  return {
    filteredData,
    filterParams,
  };
}
