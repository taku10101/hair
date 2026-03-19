import type { ExportColumn } from "./ExportButton";
import { ExportButton } from "./ExportButton";

// 利用側の型参照を維持するための alias
export type CsvExportColumn<T> = ExportColumn<T>;

interface CsvExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  columns: CsvExportColumn<T>[];
  filename: string;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "ghost";
  buttonSize?: "default" | "sm" | "lg";
}

export function CsvExportButton<T extends Record<string, unknown>>({
  filename,
  ...rest
}: CsvExportButtonProps<T>) {
  const csvFilename = filename.replace(/\.\w+$/, ".csv");
  return (
    <ExportButton {...rest} filename={csvFilename} defaultFormat="csv" showFormatSelector={false} />
  );
}
