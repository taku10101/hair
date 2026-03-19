import * as React from "react";
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/Field";

interface FormFieldContextValue {
  name: string;
  invalid?: boolean;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export function useFormField() {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error("useFormField must be used within a FormField");
  }
  return context;
}

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
  children: (field: {
    value: TFieldValues[TName];
    onChange: (...event: unknown[]) => void;
    onBlur: () => void;
  }) => React.ReactNode;
  orientation?: "vertical" | "horizontal" | "responsive";
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  children,
  orientation = "vertical",
  ...props
}: FormFieldProps<TFieldValues, TName>) {
  const { formState } = useFormContext<TFieldValues>();
  const error = formState.errors[name];
  const invalid = !!error;

  return (
    <FormFieldContext.Provider value={{ name, invalid }}>
      <Controller
        name={name}
        control={control}
        {...props}
        render={({ field }) => (
          <Field orientation={orientation} data-invalid={invalid}>
            {children(field)}
          </Field>
        )}
      />
    </FormFieldContext.Provider>
  );
}

FormField.Label = function FormFieldLabel({
  children,
  ...props
}: React.ComponentProps<typeof FieldLabel>) {
  const { name } = useFormField();
  return (
    <FieldLabel htmlFor={name} {...props}>
      {children}
    </FieldLabel>
  );
};

FormField.Description = FieldDescription;

FormField.Error = function FormFieldError({
  children,
  ...props
}: Omit<React.ComponentProps<typeof FieldError>, "errors">) {
  const { name } = useFormField();
  const { formState } = useFormContext();
  const error = formState.errors[name];

  if (children) {
    return <FieldError {...props}>{children}</FieldError>;
  }

  if (!error) {
    return null;
  }

  return <FieldError errors={[error]} {...props} />;
};

FormField.Content = FieldContent;
