"use client";

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  Children,
  isValidElement,
  useMemo,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

type ParsedOption = {
  value: string;
  label: string;
  disabled?: boolean;
  count?: string;
};

function parseOptionChildren(children: ReactNode): ParsedOption[] {
  const options: ParsedOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{
      value?: string;
      disabled?: boolean;
      children?: ReactNode;
      "data-count"?: string;
    }>;
    if (el.type !== "option") return;
    options.push({
      value: el.props.value ?? "",
      label: String(el.props.children ?? ""),
      disabled: el.props.disabled,
      count: el.props["data-count"],
    });
  });
  return options;
}

const triggerBase =
  "relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#1E2E24]/12 bg-white px-3 py-2.5 text-left text-sm text-[#1E2E24] outline-none transition focus:border-[#3d79ff]/40 focus:ring-2 focus:ring-[#3d79ff]/15 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50";

const menuPanel =
  "z-50 min-w-[var(--button-width)] rounded-2xl border border-[rgba(9,9,11,0.05)] bg-white p-1 shadow-[0px_0px_20px_0px_rgba(9,9,11,0.1)] outline-none [--anchor-gap:6px]";

const menuItem =
  "flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-[11px] text-sm leading-[1.4] text-[#00030e] outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40 data-[focus]:bg-[rgba(61,121,255,0.05)] data-[selected]:bg-[rgba(61,121,255,0.05)]";

export function SelectInput({
  className,
  children,
  value,
  onChange,
  disabled,
  required: _required,
  name: _name,
  id,
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const options = useMemo(() => parseOptionChildren(children), [children]);
  const stringValue = value === undefined || value === null ? "" : String(value);

  const selected = options.find((o) => o.value === stringValue);
  const displayLabel =
    selected?.label ||
    options.find((o) => o.value === "")?.label ||
    options[0]?.label ||
    "Select";

  const emptyOption = options.find((o) => o.value === "");
  const isPlaceholder =
    stringValue === "" && emptyOption != null && /^select/i.test(emptyOption.label.trim());

  return (
    <Listbox
      value={stringValue}
      disabled={disabled}
      onChange={(next) => {
        onChange?.({
          target: { value: next, name: _name ?? "" },
          currentTarget: { value: next, name: _name ?? "" },
        } as React.ChangeEvent<HTMLSelectElement>);
      }}
    >
      <div className={className}>
        <ListboxButton id={id} className={triggerBase}>
          <span className={`block truncate ${isPlaceholder ? "text-[rgba(0,3,14,0.45)]" : ""}`}>
            {displayLabel}
          </span>
          <ChevronDownIcon className="size-5 shrink-0 text-[rgba(0,3,14,0.35)]" aria-hidden />
        </ListboxButton>

        <ListboxOptions anchor="bottom start" transition className={menuPanel}>
          {options.map((option) => (
            <ListboxOption
              key={`${option.value}-${option.label}`}
              value={option.value}
              disabled={option.disabled}
              className={menuItem}
            >
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.count ? (
                <span className="shrink-0 text-sm text-[rgba(0,3,14,0.4)]">{option.count}</span>
              ) : null}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
