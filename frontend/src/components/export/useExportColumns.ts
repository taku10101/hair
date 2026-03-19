import { useState } from "react";
import type { ExportColumn } from "./ExportButton";

interface UseExportColumnsReturn<T extends Record<string, unknown>> {
  columns: ExportColumn<T>[];
  columnError: boolean;
  handleToggleColumn: (index: number) => void;
  handleSelectAll: () => void;
  handleDeselectAll: () => void;
  getSelectedColumns: () => { key: keyof T; header: string }[];
  validateColumns: () => boolean;
}

export function useExportColumns<T extends Record<string, unknown>>(
  initialColumns: ExportColumn<T>[]
): UseExportColumnsReturn<T> {
  const [columns, setColumns] = useState<ExportColumn<T>[]>(
    initialColumns.map((col) => ({ ...col, enabled: col.enabled ?? true }))
  );
  const [columnError, setColumnError] = useState(false);

  const handleToggleColumn = (index: number) => {
    setColumns((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], enabled: !next[index].enabled };
      }
      return next;
    });
    setColumnError(false);
  };

  const handleSelectAll = () => {
    setColumns((prev) => prev.map((col) => ({ ...col, enabled: true })));
    setColumnError(false);
  };

  const handleDeselectAll = () => {
    setColumns((prev) => prev.map((col) => ({ ...col, enabled: false })));
  };

  const getSelectedColumns = () =>
    columns.filter((col) => col.enabled).map((col) => ({ key: col.key, header: col.header }));

  const validateColumns = () => {
    if (getSelectedColumns().length === 0) {
      setColumnError(true);
      return false;
    }
    setColumnError(false);
    return true;
  };

  return {
    columns,
    columnError,
    handleToggleColumn,
    handleSelectAll,
    handleDeselectAll,
    getSelectedColumns,
    validateColumns,
  };
}
