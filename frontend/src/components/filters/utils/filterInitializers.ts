import type { FilterConfig, FilterValues, UrlParams } from "../types";

/**
 * Initialize filter values from URL params
 */
export function initializeFilterValues(
  filters: FilterConfig[],
  urlParams: UrlParams
): FilterValues {
  const initial: FilterValues = {};

  filters.forEach((filter) => {
    switch (filter.type) {
      case "search":
        initial[filter.paramName] = urlParams[filter.paramName] || "";
        break;
      case "select":
        initial[filter.paramName] = urlParams[filter.paramName] || "";
        break;
      case "multi-select":
        initial[filter.paramName] = urlParams[filter.paramName] || [];
        break;
      case "date":
        initial[filter.paramName] = urlParams[filter.paramName] || null;
        break;
      case "date-range":
        initial[filter.fromParamName] = urlParams[filter.fromParamName] || null;
        initial[filter.toParamName] = urlParams[filter.toParamName] || null;
        break;
      case "number-range":
        initial[filter.minParamName] = urlParams[filter.minParamName] || null;
        initial[filter.maxParamName] = urlParams[filter.maxParamName] || null;
        break;
    }
  });

  return initial;
}

/**
 * Reset all filter values to defaults
 */
export function resetFilterValues(filters: FilterConfig[]): {
  values: FilterValues;
  params: Record<string, null>;
} {
  const values: FilterValues = {};
  const params: Record<string, null> = {};

  filters.forEach((filter) => {
    switch (filter.type) {
      case "search":
        values[filter.paramName] = "";
        params[filter.paramName] = null;
        break;
      case "select":
        values[filter.paramName] = filter.defaultValue || "";
        params[filter.paramName] = null;
        break;
      case "multi-select":
        values[filter.paramName] = [];
        params[filter.paramName] = null;
        break;
      case "date":
        values[filter.paramName] = null;
        params[filter.paramName] = null;
        break;
      case "date-range":
        values[filter.fromParamName] = null;
        values[filter.toParamName] = null;
        params[filter.fromParamName] = null;
        params[filter.toParamName] = null;
        break;
      case "number-range":
        values[filter.minParamName] = null;
        values[filter.maxParamName] = null;
        params[filter.minParamName] = null;
        params[filter.maxParamName] = null;
        break;
    }
  });

  return { values, params };
}
