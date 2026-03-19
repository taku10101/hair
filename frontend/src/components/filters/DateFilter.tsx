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

interface DateFilterProps {
  paramName?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  // 制御モード
  value?: Date | null;
  onChange?: (date: Date | null) => void;
}

export const DateFilter = memo(function DateFilter({
  paramName = "date",
  label,
  placeholder = "Select date",
  className,
  value: controlledValue,
  onChange: controlledOnChange,
}: DateFilterProps) {
  const [isMounted] = useState(true);

  const { currentValue: currentDate, handleChange } = useFilterState<Date | null>({
    paramName,
    parser: nullableDateTime,
    controlledValue,
    onControlledChange: controlledOnChange,
  });

  const clearDate = () => {
    handleChange(null);
  };

  const formatDate = () => {
    if (currentDate) {
      return format(currentDate, "MMM dd, yyyy");
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
                !currentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDate()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentDate || undefined}
              onSelect={(date) => handleChange(date || null)}
              defaultMonth={currentDate || undefined}
            />
          </PopoverContent>
        </Popover>

        {currentDate && (
          <Button type="button" variant="ghost" size="icon" onClick={clearDate}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});
