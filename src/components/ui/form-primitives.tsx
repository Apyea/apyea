import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { DateInput } from "@/components/ui/app-date-picker";
import { SelectInput } from "@/components/ui/app-select";

export { DateInput } from "@/components/ui/app-date-picker";
export { SelectInput } from "@/components/ui/app-select";

export function FormShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#1E2E24]/8 sm:p-6">
      <div className="mb-6 border-b border-[#1E2E24]/8 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-[#1B3D32]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[#5F7A66]">{subtitle}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
      {footer ? <div className="mt-6 border-t border-[#1E2E24]/8 pt-4">{footer}</div> : null}
    </div>
  );
}

export function StepCard({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-[#FAF7F2] p-4 ring-1 ring-[#1E2E24]/6 sm:p-5">
      {label ? (
        <p className="mb-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#5F7A66]">
          {label}
        </p>
      ) : null}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

export function FieldSpan({ children }: { children: ReactNode }) {
  return <div className="md:col-span-2">{children}</div>;
}

function fieldSpanClass(span?: boolean | "sm" | "md") {
  if (!span) return "";
  return span === "sm" ? "sm:col-span-2" : "md:col-span-2";
}

/** Label + control block for form grids (replaces repeated FieldLabel + input wrappers). */
/** Validation message shown directly under the control (small red text). */
export function InputFieldError({
  id,
  message,
}: {
  id?: string;
  message?: string | null;
}) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs leading-snug text-red-600">
      {message}
    </p>
  );
}

export function FormField({
  label,
  hint,
  htmlFor,
  span,
  className,
  error,
  errorId,
  children,
}: {
  label?: ReactNode;
  hint?: string;
  htmlFor?: string;
  span?: boolean | "sm" | "md";
  className?: string;
  error?: string | null;
  errorId?: string;
  children: ReactNode;
}) {
  const spanClass = fieldSpanClass(span);
  const showLabel = label != null && label !== "";
  return (
    <div className={[spanClass, className].filter(Boolean).join(" ") || undefined}>
      {showLabel || hint ? (
        <FieldLabel hint={hint} htmlFor={htmlFor}>
          {showLabel ? label : "\u00a0"}
        </FieldLabel>
      ) : null}
      {children}
      <InputFieldError id={errorId} message={error} />
    </div>
  );
}

export function FieldLabel({
  children,
  hint,
  htmlFor,
}: {
  children: ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5 py-1">
      <label htmlFor={htmlFor} className="block py-0.5 text-sm font-medium text-[#3D5244]">
        {children}
      </label>
      {hint ? <p className="text-xs leading-snug text-[#5F7A66]">{hint}</p> : null}
    </div>
  );
}

const fieldClass =
  "w-full rounded-lg border border-[#1E2E24]/12 bg-white px-3 py-2.5 text-sm text-[#1E2E24] outline-none transition focus:border-[#2F4F3A]/50 focus:ring-2 focus:ring-[#2F4F3A]/15";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function FileInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <input
      type="file"
      {...props}
      className={`block w-full text-sm text-[#1E2E24] file:mr-3 file:rounded-lg file:border file:border-[#1E2E24]/12 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#1E2E24] hover:file:bg-[#FAF7F2] ${props.className ?? ""}`}
    />
  );
}

export function TextField({
  label,
  hint,
  span,
  className,
  error,
  name,
  id,
  ...inputProps
}: {
  label: ReactNode;
  hint?: string;
  span?: boolean | "sm" | "md";
  className?: string;
  error?: string | null;
} & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? (name ? String(name) : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  return (
    <FormField
      label={label}
      hint={hint}
      span={span}
      className={className}
      htmlFor={inputId}
      error={error}
      errorId={errorId}
    >
      <TextInput
        {...inputProps}
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
      />
    </FormField>
  );
}

export function DateField({
  label,
  hint,
  span,
  className,
  error,
  name,
  id,
  ...inputProps
}: {
  label: ReactNode;
  hint?: string;
  span?: boolean | "sm" | "md";
  className?: string;
  error?: string | null;
} & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? (name ? String(name) : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  return (
    <FormField
      label={label}
      hint={hint}
      span={span}
      className={className}
      htmlFor={inputId}
      error={error}
      errorId={errorId}
    >
      <DateInput
        {...inputProps}
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
      />
    </FormField>
  );
}

export function FileField({
  label,
  hint,
  span,
  className,
  error,
  name,
  id,
  ...inputProps
}: {
  label: ReactNode;
  hint?: string;
  span?: boolean | "sm" | "md";
  className?: string;
  error?: string | null;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const inputId = id ?? (name ? String(name) : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  return (
    <FormField
      label={label}
      hint={hint}
      span={span}
      className={className}
      htmlFor={inputId}
      error={error}
      errorId={errorId}
    >
      <FileInput
        {...inputProps}
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
      />
    </FormField>
  );
}

export function SelectField({
  label,
  hint,
  value,
  onChange,
  children,
  placeholder = "Select",
  includeEmptyOption = true,
  required,
  disabled,
  span,
  className,
  error,
  name,
  id,
}: {
  label: ReactNode;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  placeholder?: string;
  includeEmptyOption?: boolean;
  required?: boolean;
  disabled?: boolean;
  span?: boolean | "sm" | "md";
  className?: string;
  error?: string | null;
  name?: string;
  id?: string;
}) {
  const inputId = id ?? (name ? String(name) : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  return (
    <FormField
      label={label}
      hint={hint}
      span={span}
      className={className}
      htmlFor={inputId}
      error={error}
      errorId={errorId}
    >
      <SelectInput
        id={inputId}
        name={name}
        required={required}
        disabled={disabled}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        onChange={(e) => onChange(e.target.value)}
      >
        {includeEmptyOption ? <option value="">{placeholder}</option> : null}
        {children}
      </SelectInput>
    </FormField>
  );
}

export function InlineCheckboxField({
  checked,
  onChange,
  children,
  error,
  name,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
  error?: string | null;
  name?: string;
  id?: string;
}) {
  const inputId = id ?? (name ? String(name) : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  return (
    <div>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-start gap-2 py-1 text-sm text-[#3D5244]"
      >
        <input
          id={inputId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className="mt-0.5 size-[18px] rounded border-[#1E2E24]/25 accent-[#2F4F3A]"
        />
        <span>{children}</span>
      </label>
      <InputFieldError id={errorId} message={error} />
    </div>
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${fieldClass} min-h-24 resize-y ${props.className ?? ""}`}
    />
  );
}

export function TextAreaField({
  label,
  hint,
  span,
  className,
  error,
  name,
  id,
  ...props
}: {
  label: ReactNode;
  hint?: string;
  span?: boolean | "sm" | "md";
  className?: string;
  error?: string | null;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id ?? (name ? String(name) : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  return (
    <FormField
      label={label}
      hint={hint}
      span={span}
      className={className}
      htmlFor={inputId}
      error={error}
      errorId={errorId}
    >
      <TextArea
        {...props}
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
      />
    </FormField>
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex w-full items-center justify-center rounded-full bg-[#2F4F3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B3D32] disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center rounded-full border border-[#1E2E24]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#1E2E24] transition hover:bg-[#FAF7F2] disabled:opacity-50 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function StepperNav({
  steps,
  current,
  onSelect,
}: {
  steps: { id: string; title: string }[];
  current: number;
  onSelect?: (index: number) => void;
}) {
  return (
    <>
      <ol className="mb-4 flex flex-wrap gap-2 lg:hidden">
        {steps.map((step, index) => {
          const active = index === current;
          const done = index < current;
          return (
            <li
              key={step.id}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                active
                  ? "bg-[#2F4F3A] text-white"
                  : done
                    ? "bg-[#E8EFE9] text-[#1B3D32]"
                    : "bg-white text-[#5F7A66] ring-1 ring-[#1E2E24]/10"
              }`}
            >
              {index + 1}. {step.title}
            </li>
          );
        })}
      </ol>
      <nav className="hidden lg:block" aria-label="Form steps">
        <ol className="space-y-1">
          {steps.map((step, index) => {
            const active = index === current;
            const done = index < current;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  disabled={!onSelect || index > current}
                  onClick={() => onSelect?.(index)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-[#2F4F3A] font-semibold text-white"
                      : done
                        ? "bg-[#E8EFE9] font-medium text-[#1B3D32]"
                        : "text-[#5F7A66] hover:bg-[#EEF1ED]"
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      active ? "bg-white/20" : done ? "bg-[#2F4F3A]/15 text-[#1B3D32]" : "bg-[#1E2E24]/5"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {step.title}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#1E2E24]/10 bg-white px-3 py-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-[18px] rounded border-[#1E2E24]/25 accent-[#2F4F3A]"
      />
      <span className="text-sm text-[#1E2E24]">{label}</span>
    </label>
  );
}

export function RadioRow({
  name,
  value,
  checked,
  onChange,
  label,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#1E2E24]/10 bg-white px-3 py-2.5">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="accent-[#2F4F3A]"
      />
      <span className="text-sm text-[#1E2E24]">{label}</span>
    </label>
  );
}
