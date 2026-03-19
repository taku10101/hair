import { RotateCcw, Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useFilterState } from "./hooks/useFilterState";
import type { FilterConfig } from "./types";
import { resetFilterValues } from "./utils/filterInitializers";
import { buildSearchParams } from "./utils/filterParamBuilder";
import { buildQueryParsers } from "./utils/filterParsers";
import { renderFilter } from "./utils/filterRenderer";

// 便宜上、型を再エクスポート
export type { FilterConfig } from "./types";

/**
 * FilterForm Props
 */
export interface FilterFormProps {
  filters: FilterConfig[];
  className?: string;
  gridClassName?: string;
  searchButtonText?: string;
  resetButtonText?: string;
}

/**
 * Dynamic filter form component based on JSON configuration with search button
 */
export function FilterForm({
  filters,
  className,
  gridClassName,
  searchButtonText = "Search",
  resetButtonText = "Reset",
}: FilterFormProps) {
  // フィルター設定からクエリ状態パーサーを構築
  const queryParsers = useMemo(() => buildQueryParsers(filters), [filters]);
  const [urlParams, setUrlParams] = useQueryStates(queryParsers);

  // ローカルフィルター状態を管理
  // 注: urlParams型はnuqsから推論され、パース済みの値を含む
  const { localValues, setLocalValues, updateValue } = useFilterState(
    filters,
    urlParams as Record<string, string | string[] | Date | number | null>
  );

  // URLにフィルターを適用
  const handleSearch = useCallback(() => {
    const newParams = buildSearchParams(filters, localValues);
    setUrlParams(newParams);
  }, [filters, localValues, setUrlParams]);

  // すべてのフィルターをリセット
  const handleReset = useCallback(() => {
    const { values, params } = resetFilterValues(filters);
    setLocalValues(values);
    setUrlParams(params);
  }, [filters, setLocalValues, setUrlParams]);

  return (
    <div className={className}>
      <div className={cn("grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3", gridClassName)}>
        {filters.map((filter) => renderFilter(filter, localValues, updateValue))}
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={handleSearch} className="gap-2">
          <Search className="h-4 w-4" />
          {searchButtonText}
        </Button>
        <Button onClick={handleReset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          {resetButtonText}
        </Button>
      </div>
    </div>
  );
}
