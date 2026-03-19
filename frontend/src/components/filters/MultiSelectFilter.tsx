import { ChevronDown, X } from "lucide-react";
import { parseAsArrayOf, parseAsString } from "nuqs";
import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { useFilterState } from "@/hooks/useFilterState";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  paramName?: string;
  options: MultiSelectOption[];
  label?: string;
  placeholder?: string;
  className?: string;
  // 制御モード
  value?: string[];
  onChange?: (value: string[]) => void;
}

export const MultiSelectFilter = memo(function MultiSelectFilter({
  paramName = "tags",
  options,
  label,
  placeholder = "Select items...",
  className,
  value: controlledValue,
  onChange: controlledOnChange,
}: MultiSelectFilterProps) {
  const { currentValue, handleChange: baseHandleChange } = useFilterState<string[]>({
    paramName,
    parser: parseAsArrayOf(parseAsString).withDefault([]),
    controlledValue,
    onControlledChange: controlledOnChange,
  });

  const handleChange = (newValue: string[]) => {
    baseHandleChange(newValue.length > 0 ? newValue : (null as any));
  };

  const toggleOption = (value: string) => {
    if (currentValue.includes(value)) {
      const newSelected = currentValue.filter((v) => v !== value);
      handleChange(newSelected);
    } else {
      handleChange([...currentValue, value]);
    }
  };

  const removeOption = (value: string) => {
    const newSelected = currentValue.filter((v) => v !== value);
    handleChange(newSelected);
  };

  const clearAll = () => {
    handleChange([]);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-2 h-5">{label && <Label>{label}</Label>}</div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            <span className="truncate">
              {currentValue.length > 0 ? `${currentValue.length} selected` : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-64 overflow-y-auto p-4 space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${paramName}-${option.value}`}
                  checked={currentValue.includes(option.value)}
                  onCheckedChange={() => toggleOption(option.value)}
                />
                <label
                  htmlFor={`${paramName}-${option.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {currentValue.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {currentValue.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return option ? (
              <Badge key={value} variant="secondary" className="gap-1">
                {option.label}
                <button
                  type="button"
                  onClick={() => removeOption(value)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
});
