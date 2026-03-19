import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { convertToCSV, downloadCSV } from "@/lib/csvUtils";
import { downloadExcel } from "@/lib/excelUtils";
import { useExportColumns } from "./useExportColumns";

export interface ExportColumn<T> {
  key: keyof T;
  header: string;
  enabled?: boolean;
}

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "ghost";
  buttonSize?: "default" | "sm" | "lg";
  defaultFormat?: "csv" | "excel";
  showFormatSelector?: boolean;
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  columns: initialColumns,
  filename,
  buttonText = "エクスポート",
  buttonVariant = "outline",
  buttonSize = "sm",
  defaultFormat = "excel",
  showFormatSelector = true,
}: ExportButtonProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">(defaultFormat);
  const {
    columns,
    columnError,
    handleToggleColumn,
    handleSelectAll,
    handleDeselectAll,
    getSelectedColumns,
    validateColumns,
  } = useExportColumns(initialColumns);

  const handleExport = () => {
    if (!validateColumns()) return;

    const selectedColumns = getSelectedColumns();
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    if (exportFormat === "excel") {
      const filenameWithTimestamp = filename.replace(/\.(csv|xlsx)$/, `_${timestamp}.xlsx`);
      downloadExcel(data, selectedColumns, filenameWithTimestamp);
    } else {
      const csvContent = convertToCSV(data, selectedColumns);
      const filenameWithTimestamp = filename.replace(/\.(csv|xlsx)$/, `_${timestamp}.csv`);
      downloadCSV(csvContent, filenameWithTimestamp);
    }

    setDialogOpen(false);
  };

  const dialogTitle = showFormatSelector ? "データエクスポート" : "CSVエクスポート";
  const downloadLabel = exportFormat === "excel" ? "Excelを" : "CSVを";

  return (
    <>
      <Button variant={buttonVariant} size={buttonSize} onClick={() => setDialogOpen(true)}>
        <Download aria-hidden="true" className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download aria-hidden="true" className="h-5 w-5" />
              {dialogTitle}
            </DialogTitle>
            <DialogDescription>
              エクスポート形式と列を選択してください（{data.length}件）
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Format Selection */}
            {showFormatSelector && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">エクスポート形式</Label>
                <RadioGroup
                  value={exportFormat}
                  onValueChange={(value) => setExportFormat(value as "csv" | "excel")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excel" id="excel" />
                    <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer">
                      <FileSpreadsheet aria-hidden="true" className="h-4 w-4 text-green-600" />
                      <span>Excel (.xlsx)</span>
                      <span className="text-xs text-muted-foreground">推奨</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                      <FileText aria-hidden="true" className="h-4 w-4 text-blue-600" />
                      <span>CSV (.csv)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Column Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">エクスポートする列</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 text-xs"
                  >
                    すべて選択
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="h-7 text-xs"
                  >
                    すべて解除
                  </Button>
                </div>
              </div>

              {columnError && (
                <p role="alert" className="text-destructive text-sm">
                  エクスポートする列を少なくとも1つ選択してください
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1 border rounded-md">
                {columns.map((column, index) => (
                  <div key={String(column.key)} className="flex items-center space-x-2">
                    <Checkbox
                      id={`column-${String(column.key)}`}
                      checked={column.enabled}
                      onCheckedChange={() => handleToggleColumn(index)}
                    />
                    <Label
                      htmlFor={`column-${String(column.key)}`}
                      className="text-sm cursor-pointer"
                    >
                      {column.header}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleExport}>
              <Download aria-hidden="true" className="h-4 w-4 mr-2" />
              {downloadLabel}ダウンロード
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
