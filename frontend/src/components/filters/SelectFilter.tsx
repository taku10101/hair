import { parseAsStringLiteral } from "nuqs";
import { memo } from "react";
import { Label } from "@/components/ui/Label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/NativeSelect";
import { useFilterState } from "@/hooks/useFilterState";
import { cn } from "@/lib/utils";

interface SelectFilterOption {
  value: string;
  label: string;
}

interface SelectFilterProps {
  paramName?: string;
  options: SelectFilterOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  defaultValue?: string;
  // 制御モード
  value?: string;
  onChange?: (value: string) => void;
}

export const SelectFilter = memo(function SelectFilter({
  paramName = "filter",
  options,
  placeholder = "Select...",
  label,
  className,
  defaultValue,
  value: controlledValue,
  onChange: controlledOnChange,
}: SelectFilterProps) {
  const values = options.map((opt) => opt.value) as [string, ...string[]];

  const { currentValue, handleChange } = useFilterState<string>({
    paramName,
    parser: parseAsStringLiteral(values).withDefault(defaultValue || ""),
    controlledValue,
    onControlledChange: controlledOnChange,
  });

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-2 h-5">{label && <Label htmlFor={paramName}>{label}</Label>}</div>
      <NativeSelect
        id={paramName}
        value={currentValue}
        onChange={(e) => handleChange(e.target.value as (typeof values)[number])}
      >
        {placeholder && <NativeSelectOption value="">{placeholder}</NativeSelectOption>}
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
});
