"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DayMealsMap } from "@/types/calendar";
import { DayCell } from "./DayCell";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface Props {
  mealsMap: DayMealsMap;
  onDayClick: (dateStr: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

export function CalendarGrid({ mealsMap, onDayClick, onMonthChange }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-based

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

  function navigate(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear += 1; }
    if (newMonth < 1) { newMonth = 12; newYear -= 1; }
    setYear(newYear);
    setMonth(newMonth);
    onMonthChange(newYear, newMonth);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex flex-col gap-2">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
          <ChevronLeftIcon data-icon />
        </Button>
        <span className="text-sm font-medium">
          {year} 年 {month} 月
        </span>
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(1)}>
          <ChevronRightIcon data-icon />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) =>
          day === null ? (
            <div key={i} />
          ) : (
            <DayCell
              key={i}
              day={day}
              dateStr={toDateStr(year, month, day)}
              isToday={toDateStr(year, month, day) === todayStr}
              mealsMap={mealsMap}
              onClick={onDayClick}
            />
          )
        )}
      </div>
    </div>
  );
}
