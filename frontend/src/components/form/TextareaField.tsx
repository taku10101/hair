import type * as React from "react";
import { useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

interface TextareaFieldProps extends Omit<React.ComponentProps<typeof Textarea>, "name"> {
  name: string;
  label?: string;
  description?: string;
}

export function TextareaField({ name, label, description, ...props }: TextareaFieldProps) {
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
      <Textarea id={name} aria-invalid={invalid} {...register(name)} {...props} />
      <FieldError errors={error ? [error] : undefined} />
    </Field>
  );
}
