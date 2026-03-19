import type { FilterConfig, FilterValues, UrlParamValue } from "../types";

/**
 * Build search params from filter values for URL update
 */
export function buildSearchParams(
  filters: FilterConfig[],
  localValues: FilterValues
): Record<string, UrlParamValue> {
  const newParams: Record<string, UrlParamValue> = {};

  filters.forEach((filter) => {
    switch (filter.type) {
      case "search":
        newParams[filter.paramName] = localValues[filter.paramName] || null;
        break;
      case "select":
        newParams[filter.paramName] = localValues[filter.paramName] || null;
        break;
      case "multi-select": {
        const multiValue = localValues[filter.paramName] as string[];
        newParams[filter.paramName] = multiValue.length > 0 ? multiValue : null;
        break;
      }
      case "date":
        newParams[filter.paramName] = localValues[filter.paramName] || null;
        break;
      case "date-range":
        newParams[filter.fromParamName] = localValues[filter.fromParamName] || null;
        newParams[filter.toParamName] = localValues[filter.toParamName] || null;
        break;
      case "number-range":
        newParams[filter.minParamName] = localValues[filter.minParamName] || null;
        newParams[filter.maxParamName] = localValues[filter.maxParamName] || null;
        break;
    }
  });

  return newParams;
}
