import type * as React from "react";
import type { RegisterOptions } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

interface InputFieldProps extends Omit<React.ComponentProps<typeof Input>, "name"> {
  name: string;
  label?: string;
  description?: string;
  rules?: RegisterOptions;
}

export function InputField({ name, label, description, rules, ...props }: InputFieldProps) {
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
      <Input id={name} aria-invalid={invalid} {...register(name, rules)} {...props} />
      <FieldError errors={error ? [error] : undefined} />
    </Field>
  );
}
