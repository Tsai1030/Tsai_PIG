"use client";

import { cn } from "@/lib/utils";
import { DayMealsMap } from "@/types/calendar";

const MEAL_COLORS: Record<string, string> = {
  breakfast: "bg-amber-400",
  lunch: "bg-emerald-400",
  dinner: "bg-violet-400",
};

interface DayCellProps {
  day: number;
  dateStr: string; // "YYYY-MM-DD"
  isToday: boolean;
  mealsMap: DayMealsMap;
  onClick: (dateStr: string) => void;
}

export function DayCell({ day, dateStr, isToday, mealsMap, onClick }: DayCellProps) {
  const meals = mealsMap[dateStr] ?? {};
  const mealTypes = ["breakfast", "lunch", "dinner"] as const;

  return (
    <button
      onClick={() => onClick(dateStr)}
      className={cn(
        "flex flex-col items-center rounded-lg py-1 text-xs transition-colors hover:bg-muted",
        isToday && "bg-primary/10 font-medium text-primary"
      )}
    >
      <span>{day}</span>
      <div className="mt-0.5 flex gap-px">
        {mealTypes.map((type) =>
          meals[type] ? (
            <span
              key={type}
              className={cn("block size-1 rounded-full", MEAL_COLORS[type])}
            />
          ) : (
            <span key={type} className="block size-1 rounded-full bg-transparent" />
          )
        )}
      </div>
    </button>
  );
}
