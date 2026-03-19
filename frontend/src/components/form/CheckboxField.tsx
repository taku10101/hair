import type * as React from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/Field";

interface CheckboxFieldProps
  extends Omit<React.ComponentProps<typeof Checkbox>, "name" | "checked" | "onCheckedChange"> {
  name: string;
  label?: string;
  description?: string;
}

export function CheckboxField({ name, label, description, ...props }: CheckboxFieldProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const value = watch(name) ?? false;
  const error = errors[name];
  const invalid = !!error;

  return (
    <Field orientation="horizontal" data-invalid={invalid}>
      <Checkbox
        id={name}
        checked={value}
        onCheckedChange={(checked) => setValue(name, checked)}
        aria-invalid={invalid}
        {...props}
      />
      <div className="flex flex-col gap-1.5">
        {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
        <FieldError errors={error ? [error] : undefined} />
      </div>
    </Field>
  );
}
