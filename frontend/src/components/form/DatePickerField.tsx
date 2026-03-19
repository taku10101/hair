import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/Field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { formatJapaneseDate } from "@/lib/dateFormatters";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
  fromYear?: number;
  toYear?: number;
}

export function DatePickerField({
  name,
  label,
  description,
  placeholder = "日付を選択",
  captionLayout = "dropdown",
  fromYear,
  toYear,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const value = watch(name) as Date | undefined;
  const error = errors[name];
  const invalid = !!error;

  return (
    <Field data-invalid={invalid}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={name}
            className={cn("w-full justify-between font-normal", !value && "text-muted-foreground")}
            aria-invalid={invalid}
          >
            {value ? formatJapaneseDate(value) : placeholder}
            <ChevronDownIcon className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            captionLayout={captionLayout}
            fromYear={fromYear}
            toYear={toYear}
            onSelect={(date) => {
              setValue(name, date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <FieldError errors={error ? [error] : undefined} />
    </Field>
  );
}
