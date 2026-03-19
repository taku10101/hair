/**
 * Filter configuration types
 */
export type FilterConfig =
  | SearchFilterConfig
  | SelectFilterConfig
  | MultiSelectFilterConfig
  | DateFilterConfig
  | DateRangeFilterConfig
  | NumberRangeFilterConfig;

export interface BaseFilterConfig {
  id: string;
  label?: string;
  className?: string;
}

export interface SearchFilterConfig extends BaseFilterConfig {
  type: "search";
  paramName: string;
  placeholder?: string;
}

export interface SelectFilterConfig extends BaseFilterConfig {
  type: "select";
  paramName: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string;
}

export interface MultiSelectFilterConfig extends BaseFilterConfig {
  type: "multi-select";
  paramName: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export interface DateFilterConfig extends BaseFilterConfig {
  type: "date";
  paramName: string;
  placeholder?: string;
}

export interface DateRangeFilterConfig extends BaseFilterConfig {
  type: "date-range";
  fromParamName: string;
  toParamName: string;
  placeholder?: string;
}

export interface NumberRangeFilterConfig extends BaseFilterConfig {
  type: "number-range";
  minParamName: string;
  maxParamName: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}

/**
 * Filter value types
 */
export type FilterValue = string | string[] | Date | number | null;
export type FilterValues = Record<string, FilterValue>;

/**
 * URL parameter value types (from nuqs)
 */
export type UrlParamValue = string | string[] | Date | number | null;
export type UrlParams = Record<string, UrlParamValue>;
