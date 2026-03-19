import { Label } from "@/components/ui/Label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/NativeSelect";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  options?: number[];
  label?: string;
  className?: string;
}

export function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  options = [5, 10, 20, 50],
  label = "表示件数:",
  className,
}: PageSizeSelectorProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Label htmlFor="pageSize" className="text-sm whitespace-nowrap">
          {label}
        </Label>
        <NativeSelect
          id="pageSize"
          value={pageSize.toString()}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          size="sm"
        >
          {options.map((option) => (
            <NativeSelectOption key={option} value={option.toString()}>
              {option}件
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
