"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DayDetailDrawer } from "@/components/calendar/DayDetailDrawer";
import { useCalendar } from "@/hooks/useCalendar";

const TODAY = new Date();
const MEAL_LABELS = { breakfast: "🌅 早餐", lunch: "☀️ 午餐", dinner: "🌙 晚餐" } as const;

export default function HimCalendarPage() {
  const [year, setYear] = useState(TODAY.getFullYear());
  const [month, setMonth] = useState(TODAY.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: mealsMap = {}, isLoading } = useCalendar(year, month);

  const todayStr = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, "0")}-${String(TODAY.getDate()).padStart(2, "0")}`;
  const todayMeals = mealsMap[todayStr] ?? {};

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>美食日曆</CardTitle>
              <CardDescription>查看公主規劃的三餐</CardDescription>
            </div>
            <Badge variant="secondary">唯讀</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <CalendarGrid
              mealsMap={mealsMap}
              onDayClick={setSelectedDate}
              onMonthChange={(y, m) => { setYear(y); setMonth(m); }}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>今日三餐</CardTitle>
          <CardDescription>點選日期可查看詳情</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {(["breakfast", "lunch", "dinner"] as const).map((type) => {
              const meal = todayMeals[type];
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-sm shrink-0">{MEAL_LABELS[type]}</span>
                  {meal ? (
                    <span className="text-sm font-medium truncate">{meal.restaurant_name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">等待公主規劃</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <DayDetailDrawer
          open={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          dateStr={selectedDate}
          mealsMap={mealsMap}
        />
      )}
    </div>
  );
}
