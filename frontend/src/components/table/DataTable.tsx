import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // ページネーション
  pageSize?: number;
  pageIndex?: number;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  manualPagination?: boolean;
  // 行選択
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  getRowId?: (row: TData, index: number) => string;
  // ソート
  enableSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  manualSorting?: boolean;
  // ローディング状態
  isLoading?: boolean;
  // 追加のテーブルオプション
  tableOptions?: Partial<TableOptions<TData>>;
  // ページネーションコントロールのカスタマイズ
  showPaginationInfo?: boolean;
  paginationInfoTemplate?: (params: {
    startIndex: number;
    endIndex: number;
    totalCount: number;
  }) => React.ReactNode;
  // カスタムレンダリング
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  // クラスのカスタマイズ
  className?: string;
  tableClassName?: string;
  containerClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  pageIndex = 0,
  pageCount,
  onPaginationChange,
  manualPagination = false,
  enableRowSelection = false,
  rowSelection = {},
  onRowSelectionChange,
  getRowId,
  enableSorting = false,
  sorting = [],
  onSortingChange,
  manualSorting = false,
  isLoading = false,
  tableOptions,
  showPaginationInfo = true,
  paginationInfoTemplate,
  renderEmpty,
  renderLoading,
  className,
  tableClassName,
  containerClassName,
}: DataTableProps<TData, TValue>) {
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex,
    pageSize,
  });

  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>(rowSelection);

  const [internalSorting, setInternalSorting] = React.useState<SortingState>(sorting);

  const pagination = useMemo(
    () => (onPaginationChange ? { pageIndex, pageSize } : internalPagination),
    [onPaginationChange, pageIndex, pageSize, internalPagination]
  );

  const rowSelectionState = onRowSelectionChange ? rowSelection : internalRowSelection;

  const sortingState = onSortingChange ? sorting : internalSorting;

  const handlePaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const newPagination = typeof updater === "function" ? updater(pagination) : updater;
      if (onPaginationChange) {
        onPaginationChange(newPagination);
      } else {
        setInternalPagination(newPagination);
      }
    },
    [pagination, onPaginationChange]
  );

  const handleRowSelectionChange = useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const newSelection = typeof updater === "function" ? updater(rowSelectionState) : updater;
      if (onRowSelectionChange) {
        onRowSelectionChange(newSelection);
      } else {
        setInternalRowSelection(newSelection);
      }
    },
    [rowSelectionState, onRowSelectionChange]
  );

  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting = typeof updater === "function" ? updater(sortingState) : updater;
      if (onSortingChange) {
        onSortingChange(newSorting);
      } else {
        setInternalSorting(newSorting);
      }
    },
    [sortingState, onSortingChange]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: enableSorting && !manualSorting ? getSortedRowModel() : undefined,
    manualPagination,
    manualSorting,
    pageCount: pageCount ?? (manualPagination ? -1 : undefined),
    state: {
      pagination,
      rowSelection: enableRowSelection ? rowSelectionState : undefined,
      sorting: enableSorting ? sortingState : undefined,
    },
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: enableRowSelection ? handleRowSelectionChange : undefined,
    onSortingChange: enableSorting ? handleSortingChange : undefined,
    enableRowSelection,
    enableSorting,
    getRowId,
    ...tableOptions,
  });

  const totalCount = manualPagination ? (pageCount ?? 0) * pageSize : data.length;
  const startIndex = pagination.pageIndex * pageSize + 1;
  const endIndex = Math.min((pagination.pageIndex + 1) * pageSize, totalCount);

  if (isLoading && renderLoading) {
    return <>{renderLoading()}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (data.length === 0 && renderEmpty) {
    return <>{renderEmpty()}</>;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">データがありません</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={containerClassName}>
        <Table className={tableClassName}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={enableRowSelection && row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 px-2 py-4">
        {showPaginationInfo &&
          (paginationInfoTemplate ? (
            paginationInfoTemplate({ startIndex, endIndex, totalCount })
          ) : (
            <div className="text-muted-foreground text-sm">
              {totalCount > 0 && `全 ${totalCount} 件中 ${startIndex} - ${endIndex} 件表示`}
            </div>
          ))}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            最初
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            前へ
          </Button>
          <div className="text-muted-foreground text-sm">
            {pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            次へ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            最後
          </Button>
        </div>
      </div>
    </div>
  );
}

// ソート可能なヘッダーを作成するヘルパー関数
interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function SortableHeader<TData, TValue>({
  column,
  title,
  className,
}: SortableHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>;
  }

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={cn("-ml-3 h-8", className)}
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}

// 選択列を作成するヘルパー関数
export function createSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="すべて選択"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="行を選択"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}
