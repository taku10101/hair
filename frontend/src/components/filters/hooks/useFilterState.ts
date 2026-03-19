import { useCallback, useState } from "react";
import type { FilterConfig, FilterValue, FilterValues, UrlParams } from "../types";
import { initializeFilterValues } from "../utils/filterInitializers";

/**
 * Custom hook to manage filter state
 */
export function useFilterState(filters: FilterConfig[], urlParams: UrlParams) {
  const [localValues, setLocalValues] = useState<FilterValues>(() =>
    initializeFilterValues(filters, urlParams)
  );

  const updateValue = useCallback((key: string, value: FilterValue) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    localValues,
    setLocalValues,
    updateValue,
  };
}
