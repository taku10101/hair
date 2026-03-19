import { X } from "lucide-react";
import { createParser, parseAsInteger } from "nuqs";
import { memo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useFilterState } from "@/hooks/useFilterState";
import { cn } from "@/lib/utils";

const nullableInteger = createParser<number | null>({
  parse: (value: string) => {
    if (!value) return null;
    try {
      const num = parseAsInteger.parseServerSide(value);
      return num;
    } catch {
      return null;
    }
  },
  serialize: (value: number | null) => {
    return value !== null ? value.toString() : "";
  },
});

interface NumberRangeFilterProps {
  minParamName?: string;
  maxParamName?: string;
  label?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  className?: string;
  // 制御モード
  minValue?: number | null;
  maxValue?: number | null;
  onMinChange?: (value: number | null) => void;
  onMaxChange?: (value: number | null) => void;
}

export const NumberRangeFilter = memo(function NumberRangeFilter({
  minParamName = "min",
  maxParamName = "max",
  label,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  className,
  minValue: controlledMinValue,
  maxValue: controlledMaxValue,
  onMinChange: controlledOnMinChange,
  onMaxChange: controlledOnMaxChange,
}: NumberRangeFilterProps) {
  const { currentValue: currentMin, handleChange: handleMinChange } = useFilterState<number | null>(
    {
      paramName: minParamName,
      parser: nullableInteger,
      controlledValue: controlledMinValue,
      onControlledChange: controlledOnMinChange,
    }
  );

  const { currentValue: currentMax, handleChange: handleMaxChange } = useFilterState<number | null>(
    {
      paramName: maxParamName,
      parser: nullableInteger,
      controlledValue: controlledMaxValue,
      onControlledChange: controlledOnMaxChange,
    }
  );

  const clearRange = () => {
    handleMinChange(null);
    handleMaxChange(null);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-2 h-5">{label && <Label>{label}</Label>}</div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder={minPlaceholder}
          value={currentMin ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            handleMinChange(value ? parseInt(value, 10) : null);
          }}
          className="flex-1"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          placeholder={maxPlaceholder}
          value={currentMax ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            handleMaxChange(value ? parseInt(value, 10) : null);
          }}
          className="flex-1"
        />
        {(currentMin !== null || currentMax !== null) && (
          <Button type="button" variant="ghost" size="icon" onClick={clearRange}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});
