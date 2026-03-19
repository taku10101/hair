import type * as React from "react";
import { useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/Field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/NativeSelect";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps extends Omit<React.ComponentProps<typeof NativeSelect>, "name"> {
  name: string;
  label?: string;
  description?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function SelectField({
  name,
  label,
  description,
  options,
  placeholder,
  ...props
}: SelectFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const invalid = !!error;

  return (
    <Field data-invalid={invalid}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
      <NativeSelect id={name} aria-invalid={invalid} {...register(name)} {...props}>
        {placeholder && (
          <NativeSelectOption value="" disabled>
            {placeholder}
          </NativeSelectOption>
        )}
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <FieldError errors={error ? [error] : undefined} />
    </Field>
  );
}
