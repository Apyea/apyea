"use client";

import { useForm, useStore } from "@tanstack/react-form";
import type { InputHTMLAttributes, ReactNode } from "react";
import {
  DateField,
  InlineCheckboxField,
  InputFieldError,
  SelectField,
  TextField,
} from "@/components/ui/form-primitives";

export { useForm, useStore };

export function fieldValidator(check: (value: string) => string | null) {
  return ({ value }: { value: unknown }) => {
    const v = value == null ? "" : String(value);
    return check(v) ?? undefined;
  };
}

export function fieldValidatorNumber(check: (value: number) => string | null) {
  return ({ value }: { value: unknown }) => {
    const n = value === "" || value == null ? NaN : Number(value);
    return check(n) ?? undefined;
  };
}

export function fieldValidatorBoolean(check: (value: boolean) => string | null) {
  return ({ value }: { value: unknown }) => check(Boolean(value)) ?? undefined;
}

type FieldMetaErrors = {
  errors?: unknown[];
  errorMap?: Record<string, unknown>;
};

export function formatFieldErrorMessage(meta: FieldMetaErrors): string | undefined {
  const messages: string[] = [];
  for (const e of meta.errors ?? []) {
    if (e != null && e !== "") messages.push(typeof e === "string" ? e : String(e));
  }
  if (meta.errorMap) {
    for (const v of Object.values(meta.errorMap)) {
      if (v != null && v !== "") messages.push(typeof v === "string" ? v : String(v));
    }
  }
  if (!messages.length) return undefined;
  return [...new Set(messages)].join(", ");
}

export function FieldError({
  message,
  id,
}: {
  message?: string | null;
  id?: string;
}) {
  return <InputFieldError id={id} message={message} />;
}

/** @deprecated use FieldError — kept for imports */
export const FormFieldError = FieldError;

type Span = boolean | "sm" | "md";

type FieldMeta = FieldMetaErrors & {
  isTouched?: boolean;
  isBlurred?: boolean;
};

/** Loosely typed form instance for shared APYEA field wrappers. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApyeaFormApi = any;

function mergeFieldValidators(validators?: {
  onChange?: (ctx: { value: string }) => string | undefined;
  onBlur?: (ctx: { value: string }) => string | undefined;
  onSubmit?: (ctx: { value: string }) => string | undefined;
}) {
  if (!validators) return undefined;
  const onSubmit =
    validators.onSubmit ?? validators.onBlur ?? validators.onChange;
  return { ...validators, onSubmit };
}

export function ApyeaTextField({
  formApi,
  name,
  label,
  hint,
  span,
  validators,
  sanitize,
  ...inputProps
}: {
  formApi: ApyeaFormApi;
  name: string;
  label: ReactNode;
  hint?: string;
  span?: Span;
  validators?: {
    onChange?: (ctx: { value: string }) => string | undefined;
    onBlur?: (ctx: { value: string }) => string | undefined;
    onSubmit?: (ctx: { value: string }) => string | undefined;
  };
  sanitize?: (raw: string) => string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "onBlur" | "name">) {
  const mergedValidators = mergeFieldValidators(validators);
  return (
    <formApi.Field name={name} validators={mergedValidators}>
      {(field: {
        name: string;
        state: { value: unknown; meta: FieldMeta };
        handleBlur: () => void;
        handleChange: (value: unknown) => void;
      }) => {
        const error = formatFieldErrorMessage(field.state.meta);
        return (
          <TextField
            label={label}
            hint={hint}
            span={span}
            name={field.name}
            value={String(field.state.value ?? "")}
            error={error}
            onBlur={field.handleBlur}
            onChange={(e) => {
              const next = sanitize ? sanitize(e.target.value) : e.target.value;
              field.handleChange(next);
            }}
            {...inputProps}
          />
        );
      }}
    </formApi.Field>
  );
}

export function ApyeaSelectField({
  formApi,
  name,
  label,
  hint,
  span,
  children,
  placeholder,
  includeEmptyOption,
  disabled,
  validators,
  onValueChange,
}: {
  formApi: ApyeaFormApi;
  name: string;
  label: ReactNode;
  hint?: string;
  span?: Span;
  children: ReactNode;
  placeholder?: string;
  includeEmptyOption?: boolean;
  disabled?: boolean;
  validators?: {
    onChange?: (ctx: { value: string }) => string | undefined;
    onSubmit?: (ctx: { value: string }) => string | undefined;
  };
  onValueChange?: (value: string) => void;
}) {
  const mergedValidators = validators
    ? { ...validators, onSubmit: validators.onSubmit ?? validators.onChange }
    : undefined;
  return (
    <formApi.Field name={name} validators={mergedValidators}>
      {(field: {
        name: string;
        state: { value: unknown; meta: FieldMeta };
        handleChange: (value: unknown) => void;
      }) => (
        <SelectField
          label={label}
          hint={hint}
          span={span}
          name={field.name}
          disabled={disabled}
          value={String(field.state.value ?? "")}
          placeholder={placeholder}
          includeEmptyOption={includeEmptyOption}
          error={formatFieldErrorMessage(field.state.meta)}
          onChange={(value) => {
            field.handleChange(value);
            onValueChange?.(value);
          }}
        >
          {children}
        </SelectField>
      )}
    </formApi.Field>
  );
}

export function ApyeaDateField({
  formApi,
  name,
  label,
  hint,
  span,
  max,
  validators,
}: {
  formApi: ApyeaFormApi;
  name: string;
  label: ReactNode;
  hint?: string;
  span?: Span;
  max?: string;
  validators?: {
    onChange?: (ctx: { value: string }) => string | undefined;
    onBlur?: (ctx: { value: string }) => string | undefined;
    onSubmit?: (ctx: { value: string }) => string | undefined;
  };
}) {
  const mergedValidators = mergeFieldValidators(validators);
  return (
    <formApi.Field name={name} validators={mergedValidators}>
      {(field: {
        name: string;
        state: { value: unknown; meta: FieldMeta };
        handleBlur: () => void;
        handleChange: (value: unknown) => void;
      }) => (
        <DateField
          label={label}
          hint={hint}
          span={span}
          max={max}
          name={field.name}
          value={String(field.state.value ?? "")}
          error={formatFieldErrorMessage(field.state.meta)}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      )}
    </formApi.Field>
  );
}

export function ApyeaCheckboxField({
  formApi,
  name,
  validators,
  children,
}: {
  formApi: ApyeaFormApi;
  name: string;
  children: ReactNode;
  validators?: {
    onChange?: (ctx: { value: boolean }) => string | undefined;
    onSubmit?: (ctx: { value: boolean }) => string | undefined;
  };
}) {
  const mergedValidators = validators
    ? { ...validators, onSubmit: validators.onSubmit ?? validators.onChange }
    : undefined;
  return (
    <formApi.Field name={name} validators={mergedValidators}>
      {(field: {
        name: string;
        state: { value: unknown; meta: FieldMeta };
        handleChange: (value: unknown) => void;
      }) => (
        <InlineCheckboxField
          name={field.name}
          checked={Boolean(field.state.value)}
          error={formatFieldErrorMessage(field.state.meta)}
          onChange={(checked) => field.handleChange(checked)}
        >
          {children}
        </InlineCheckboxField>
      )}
    </formApi.Field>
  );
}
