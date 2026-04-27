"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type SelectOption = {
  label: string;
  value: string;
};

type CompactSelectProps = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

export function CompactSelect({ value, options, onChange }: CompactSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-white px-3 text-left text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} className={open ? "rotate-180 text-[#6B7280] transition" : "text-[#9CA3AF] transition"} />
      </button>

      {open && (
        <ul className="absolute left-0 top-[calc(100%+6px)] z-30 w-full rounded-xl border border-border bg-white p-1 shadow-soft">
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={
                    isActive
                      ? "flex w-full items-center justify-between rounded-lg bg-[#EEF2FF] px-2.5 py-2 text-sm font-medium text-[#3730A3]"
                      : "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-[#F3F4F6]"
                  }
                >
                  {option.label}
                  {isActive && <Check size={14} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
