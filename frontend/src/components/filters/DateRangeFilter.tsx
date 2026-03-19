import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { createParser, parseAsIsoDateTime } from "nuqs";
import { memo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Label } from "@/components/ui/Label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { useFilterState } from "@/hooks/useFilterState";
import { cn } from "@/lib/utils";

const nullableDateTime = createParser<Date | null>({
  parse: (value: string) => {
    if (!value) return null;
    try {
      const date = parseAsIsoDateTime.parseServerSide(value);
      return date;
    } catch {
      return null;
    }
  },
  serialize: (value: Date | null) => {
    return value ? value.toISOString() : "";
  },
});

interface DateRangeFilterProps {
  fromParamName?: string;
  toParamName?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  // 制御モード
  fromValue?: Date | null;
  toValue?: Date | null;
  onFromChange?: (date: Date | null) => void;
  onToChange?: (date: Date | null) => void;
}

export const DateRangeFilter = memo(function DateRangeFilter({
  fromParamName = "from",
  toParamName = "to",
  label,
  placeholder = "Select date range",
  className,
  fromValue: controlledFromValue,
  toValue: controlledToValue,
  onFromChange: controlledOnFromChange,
  onToChange: controlledOnToChange,
}: DateRangeFilterProps) {
  const [isMounted] = useState(true);

  const { currentValue: currentFromDate, handleChange: handleFromChange } =
    useFilterState<Date | null>({
      paramName: fromParamName,
      parser: nullableDateTime,
      controlledValue: controlledFromValue,
      onControlledChange: controlledOnFromChange,
    });

  const { currentValue: currentToDate, handleChange: handleToChange } = useFilterState<Date | null>(
    {
      paramName: toParamName,
      parser: nullableDateTime,
      controlledValue: controlledToValue,
      onControlledChange: controlledOnToChange,
    }
  );

  const clearDates = () => {
    handleFromChange(null);
    handleToChange(null);
  };

  const formatDateRange = () => {
    if (currentFromDate && currentToDate) {
      return `${format(currentFromDate, "MMM dd, yyyy")} - ${format(currentToDate, "MMM dd, yyyy")}`;
    }
    if (currentFromDate) {
      return `From ${format(currentFromDate, "MMM dd, yyyy")}`;
    }
    if (currentToDate) {
      return `To ${format(currentToDate, "MMM dd, yyyy")}`;
    }
    return placeholder;
  };

  if (!isMounted) {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="mb-2 h-5">{label && <Label>{label}</Label>}</div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal text-muted-foreground"
            disabled
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {placeholder}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-2 h-5">{label && <Label>{label}</Label>}</div>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !currentFromDate && !currentToDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-xs mb-2 block">From</Label>
                <Calendar
                  mode="single"
                  selected={currentFromDate || undefined}
                  onSelect={(date) => handleFromChange(date || null)}
                  disabled={(date) => (currentToDate ? date > currentToDate : false)}
                />
              </div>
              <div>
                <Label className="text-xs mb-2 block">To</Label>
                <Calendar
                  mode="single"
                  selected={currentToDate || undefined}
                  onSelect={(date) => handleToChange(date || null)}
                  disabled={(date) => (currentFromDate ? date < currentFromDate : false)}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {(currentFromDate || currentToDate) && (
          <Button type="button" variant="ghost" size="icon" onClick={clearDates}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});
