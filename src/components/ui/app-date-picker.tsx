"use client";

import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { forwardRef, useMemo, type InputHTMLAttributes } from "react";
import DatePicker from "react-datepicker";

const triggerClass =
  "relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#1E2E24]/12 bg-white px-3 py-2.5 text-left text-sm text-[#1E2E24] outline-none transition focus:border-[#3d79ff]/40 focus:ring-2 focus:ring-[#3d79ff]/15 disabled:cursor-not-allowed disabled:opacity-50";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function toIsoDateString(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseIsoDate(value: string | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function yearBounds(minDate: Date | null, maxDate: Date | null, includeYear?: number) {
  const currentYear = new Date().getFullYear();
  let endYear = maxDate?.getFullYear() ?? currentYear;
  let startYear = minDate?.getFullYear() ?? endYear - 100;
  if (startYear > endYear) [startYear, endYear] = [endYear, startYear];
  if (includeYear != null) {
    startYear = Math.min(startYear, includeYear);
    endYear = Math.max(endYear, includeYear);
  }
  return { startYear, endYear };
}

function yearOptions(startYear: number, endYear: number) {
  const years: number[] = [];
  for (let y = endYear; y >= startYear; y--) years.push(y);
  return years;
}

type CustomInputProps = {
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
  id?: string;
};

const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>(function CustomInput(
  { value, onClick, disabled, id },
  ref,
) {
  const placeholder = !value;
  return (
    <button
      ref={ref}
      type="button"
      id={id}
      disabled={disabled}
      onClick={onClick}
      className={triggerClass}
    >
      <span className={placeholder ? "text-[rgba(0,3,14,0.45)]" : ""}>
        {placeholder ? "Select date" : value}
      </span>
      <CalendarDaysIcon className="size-5 shrink-0 text-[rgba(0,3,14,0.35)]" aria-hidden />
    </button>
  );
});

export function DateInput({
  className,
  value,
  onChange,
  disabled,
  min,
  max,
  required: _required,
  name,
  id,
}: InputHTMLAttributes<HTMLInputElement>) {
  const stringValue = value === undefined || value === null ? "" : String(value);
  const selected = useMemo(() => parseIsoDate(stringValue), [stringValue]);
  const minDate = useMemo(() => parseIsoDate(min ? String(min) : undefined), [min]);
  const maxDate = useMemo(() => parseIsoDate(max ? String(max) : undefined), [max]);

  function pick(date: Date | null) {
    if (!date) return;
    const iso = toIsoDateString(date);
    onChange?.({
      target: { value: iso, name: name ?? "" },
      currentTarget: { value: iso, name: name ?? "" },
    } as React.ChangeEvent<HTMLInputElement>);
  }

  return (
    <div className={["apyea-datepicker-root w-full", className].filter(Boolean).join(" ")}>
      <DatePicker
        selected={selected}
        onChange={pick}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        disabled={disabled}
        id={id}
        customInput={<CustomInput id={id} disabled={disabled} />}
        calendarClassName="apyea-datepicker"
        popperClassName="apyea-datepicker-popper"
        showPopperArrow={false}
        dateFormat="d MMM yyyy"
        calendarStartDay={0}
        renderCustomHeader={({
          date,
          changeMonth,
          changeYear,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => {
          const { startYear, endYear } = yearBounds(minDate, maxDate, date.getFullYear());
          const years = yearOptions(startYear, endYear);
          const month = date.getMonth();
          const year = date.getFullYear();

          return (
            <div className="apyea-datepicker__header">
              <button
                type="button"
                aria-label="Previous month"
                disabled={prevMonthButtonDisabled}
                className="apyea-datepicker__nav"
                onClick={decreaseMonth}
              >
                <ChevronLeftIcon className="size-4 text-[#09090b]" />
              </button>
              <div className="apyea-datepicker__controls">
                <select
                  className="apyea-datepicker__select"
                  aria-label="Month"
                  value={month}
                  onChange={(e) => changeMonth(Number(e.target.value))}
                >
                  {MONTHS.map((label, i) => (
                    <option key={label} value={i}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  className="apyea-datepicker__select apyea-datepicker__select--year"
                  aria-label="Year"
                  value={year}
                  onChange={(e) => changeYear(Number(e.target.value))}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                aria-label="Next month"
                disabled={nextMonthButtonDisabled}
                className="apyea-datepicker__nav"
                onClick={increaseMonth}
              >
                <ChevronRightIcon className="size-4 text-[#09090b]" />
              </button>
            </div>
          );
        }}
      />
    </div>
  );
}
