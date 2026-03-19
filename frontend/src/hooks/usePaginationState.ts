import type { PaginationState } from "@tanstack/react-table";
import { parseAsInteger, useQueryStates } from "nuqs";

interface UsePaginationStateOptions {
  defaultPageSize?: number;
  pageParamName?: string;
  pageSizeParamName?: string;
}

interface UsePaginationStateReturn {
  page: number;
  pageSize: number;
  pageIndex: number; // react-table用の0始まりのインデックス
  onPaginationChange: (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetPagination: () => void;
}

/**
 * nuqsを使ってページネーション状態をURL管理するカスタムフック
 *
 * @example
 * ```tsx
 * const { pageIndex, pageSize, onPaginationChange } = usePaginationState()
 *
 * <DataTable
 *   pageIndex={pageIndex}
 *   pageSize={pageSize}
 *   onPaginationChange={onPaginationChange}
 * />
 * ```
 */
export function usePaginationState(
  options: UsePaginationStateOptions = {}
): UsePaginationStateReturn {
  const { defaultPageSize = 10, pageParamName = "page", pageSizeParamName = "pageSize" } = options;

  const [params, setParams] = useQueryStates({
    [pageParamName]: parseAsInteger.withDefault(1),
    [pageSizeParamName]: parseAsInteger.withDefault(defaultPageSize),
  });

  const page = params[pageParamName];
  const pageSize = params[pageSizeParamName];

  const onPaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => {
    const currentPagination: PaginationState = {
      pageIndex: page - 1, // nuqsは1始まり、react-tableは0始まり
      pageSize,
    };

    const newPagination = typeof updater === "function" ? updater(currentPagination) : updater;

    setParams({
      [pageParamName]: newPagination.pageIndex + 1, // 0始まりを1始まりに変換
      [pageSizeParamName]: newPagination.pageSize,
    });
  };

  const setPage = (newPage: number) => {
    setParams({ [pageParamName]: newPage });
  };

  const setPageSize = (newPageSize: number) => {
    setParams({
      [pageSizeParamName]: newPageSize,
      [pageParamName]: 1, // ページサイズ変更時はページを1にリセット
    });
  };

  const resetPagination = () => {
    setParams({
      [pageParamName]: 1,
      [pageSizeParamName]: defaultPageSize,
    });
  };

  return {
    page,
    pageSize,
    pageIndex: page - 1, // react-table用の0始まりインデックス
    onPaginationChange,
    setPage,
    setPageSize,
    resetPagination,
  };
}
