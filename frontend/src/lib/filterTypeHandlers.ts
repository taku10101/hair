import { parseAsArrayOf, parseAsInteger, parseAsIsoDateTime, parseAsString } from "nuqs";
import type {
  DateFilterConfig,
  DateRangeFilterConfig,
  FilterConfig,
  MultiSelectFilterConfig,
  NumberRangeFilterConfig,
  SearchFilterConfig,
  SelectFilterConfig,
} from "@/components/filters";

/**
 * Handler interface for each filter type.
 * Separates parser building and matching logic for better maintainability.
 */
interface FilterTypeHandler<T extends FilterConfig = FilterConfig> {
  /**
   * Builds the nuqs parser for this filter type
   */
  buildParser: (filter: T) => any;

  /**
   * Checks if an item matches the filter criteria
   * @param item - The data item to check
   * @param filterParams - All filter parameters from URL
   * @param filter - The filter configuration
   * @returns true if the item matches, false otherwise
   */
  matches: (item: any, filterParams: Record<string, any>, filter: T) => boolean;
}

/**
 * Filter type handlers for each supported filter type.
 * This centralizes all filter logic and makes it easy to add new filter types.
 */
export const filterTypeHandlers: Record<string, FilterTypeHandler<any>> = {
  search: {
    buildParser: () => parseAsString.withDefault(""),
    matches: (item, filterParams, filter: SearchFilterConfig) => {
      const searchValue = filterParams[filter.paramName] as string;
      if (!searchValue) return true;

      const searchLower = searchValue.toLowerCase();
      // すべての文字列フィールドを横断検索
      return Object.values(item).some((value) => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      });
    },
  },

  select: {
    buildParser: (filter: SelectFilterConfig) =>
      parseAsString.withDefault(filter.defaultValue || ""),
    matches: (item, filterParams, filter: SelectFilterConfig) => {
      const selectValue = filterParams[filter.paramName] as string;
      if (!selectValue) return true;

      const itemValue = item[filter.paramName];

      // ブール値を処理 - 比較のために文字列をブール値に変換
      if (typeof itemValue === "boolean") {
        const boolValue = selectValue === "true";
        return itemValue === boolValue;
      }

      // 非ブールフィールドの場合は完全一致
      return itemValue === selectValue;
    },
  },

  "multi-select": {
    buildParser: () => parseAsArrayOf(parseAsString).withDefault([]),
    matches: (item, filterParams, filter: MultiSelectFilterConfig) => {
      const selectedValues = filterParams[filter.paramName] as string[];
      if (!selectedValues || selectedValues.length === 0) return true;

      // アイテムの値が選択された値に含まれるかチェック
      return selectedValues.includes(item[filter.paramName]);
    },
  },

  date: {
    buildParser: () => parseAsIsoDateTime,
    matches: (item, filterParams, filter: DateFilterConfig) => {
      const filterDate = filterParams[filter.paramName] as Date | null;
      if (!filterDate) return true;

      const itemDateStr = item[filter.paramName];
      if (!itemDateStr) return false;

      const itemDate = new Date(itemDateStr);

      // 日レベルで日付を比較（時刻は無視）
      const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      const filterDay = new Date(
        filterDate.getFullYear(),
        filterDate.getMonth(),
        filterDate.getDate()
      );

      return itemDay.getTime() === filterDay.getTime();
    },
  },

  "date-range": {
    buildParser: (filter: DateRangeFilterConfig) => {
      // 日付範囲は2つのパラメータを使用
      return {
        [filter.fromParamName]: parseAsIsoDateTime,
        [filter.toParamName]: parseAsIsoDateTime,
      };
    },
    matches: (item, filterParams, filter: DateRangeFilterConfig) => {
      const fromDate = filterParams[filter.fromParamName] as Date | null;
      const toDate = filterParams[filter.toParamName] as Date | null;

      if (!fromDate && !toDate) return true;

      // _gteまたは_lteサフィックスを削除してフィールド名を抽出
      const fieldName = filter.fromParamName.replace(/_gte$/, "").replace(/_lte$/, "");
      const itemDateStr = item[fieldName];

      if (!itemDateStr) return true;

      const itemDate = new Date(itemDateStr);

      // 日付を比較 - fromDateは日の開始、toDateは日の終了を含む
      if (fromDate) {
        const fromStart = new Date(fromDate);
        fromStart.setHours(0, 0, 0, 0);
        if (itemDate < fromStart) {
          return false;
        }
      }

      if (toDate) {
        const toEnd = new Date(toDate);
        toEnd.setHours(23, 59, 59, 999);
        if (itemDate > toEnd) {
          return false;
        }
      }

      return true;
    },
  },

  "number-range": {
    buildParser: (filter: NumberRangeFilterConfig) => {
      // 数値範囲は2つのパラメータを使用
      return {
        [filter.minParamName]: parseAsInteger,
        [filter.maxParamName]: parseAsInteger,
      };
    },
    matches: (item, filterParams, filter: NumberRangeFilterConfig) => {
      const minValue = filterParams[filter.minParamName] as number | null;
      const maxValue = filterParams[filter.maxParamName] as number | null;

      if (minValue === null && maxValue === null) return true;

      const itemValue = item[filter.minParamName.replace("_min", "").replace("Min", "")];

      if (minValue !== null && itemValue < minValue) {
        return false;
      }

      if (maxValue !== null && itemValue > maxValue) {
        return false;
      }

      return true;
    },
  },
};

/**
 * Build query parsers for all filters
 */
export function buildQueryParsers(filters: FilterConfig[]): Record<string, any> {
  return filters.reduce<Record<string, any>>((acc, filter) => {
    const handler = filterTypeHandlers[filter.type];
    if (!handler) {
      return acc;
    }

    const parser = handler.buildParser(filter as any);

    // パーサーが複数のパラメータを返す特殊ケースを処理（日付範囲、数値範囲）
    if (typeof parser === "object" && !parser.withDefault) {
      Object.assign(acc, parser);
    } else {
      // paramNameプロパティを持つフィルター用
      if ("paramName" in filter) {
        acc[filter.paramName] = parser;
      }
    }

    return acc;
  }, {});
}
