"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type CompactDatePickerProps = {
  value: Date | null;
  onChange: (date: Date) => void;
};

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthNames = [
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
  "December"
];

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function formatDate(value: Date | null) {
  if (!value) return "dd/mm/yyyy";
  const day = `${value.getDate()}`.padStart(2, "0");
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  return `${day}/${month}/${value.getFullYear()}`;
}

function buildMonthDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: Array<{ date: Date; currentMonth: boolean }> = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    days.push({ date: new Date(year, month - 1, day), currentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ date: new Date(year, month, day), currentMonth: true });
  }

  const trailing = (7 - (days.length % 7)) % 7;
  for (let day = 1; day <= trailing; day++) {
    days.push({ date: new Date(year, month + 1, day), currentMonth: false });
  }

  return days;
}

export function CompactDatePicker({ value, onChange }: CompactDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ?? new Date());
  const rootRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => buildMonthDays(viewDate), [viewDate]);

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
        <span className={value ? "text-foreground" : "text-[#9CA3AF]"}>{formatDate(value)}</span>
        <CalendarDays size={15} className="text-[#9CA3AF]" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-[290px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-white p-2.5 shadow-soft">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-foreground">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[#6B7280]">
            {weekDays.map((label) => (
              <span key={label} className="py-1">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map(({ date, currentMonth }) => {
              const selected = value && isSameDay(date, value);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => {
                    onChange(date);
                    setOpen(false);
                    setViewDate(date);
                  }}
                  className={
                    selected
                      ? "h-8 rounded-md bg-[#1D4ED8] text-xs font-semibold text-white"
                      : currentMonth
                        ? "h-8 rounded-md text-xs text-foreground hover:bg-[#EEF2FF]"
                        : "h-8 rounded-md text-xs text-[#9CA3AF] hover:bg-[#F3F4F6]"
                  }
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                onChange(today);
                setViewDate(today);
              }}
              className="rounded-md px-2 py-1 text-xs font-medium text-[#4F46E5] hover:bg-[#EEF2FF]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-xs font-medium text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
