"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";

const TODAY = new Date();
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function CalendarPreview() {
  const year = TODAY.getFullYear();
  const month = TODAY.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = TODAY.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex flex-col gap-2">
      {/* Month header */}
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <CalendarIcon />
        <span>
          {year} 年 {month + 1} 月
        </span>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div
            key={i}
            className={
              day === todayDate
                ? "flex flex-col items-center rounded-lg bg-primary/10 py-1 text-xs font-medium text-primary"
                : "flex flex-col items-center rounded-lg py-1 text-xs text-muted-foreground"
            }
          >
            {day ?? ""}
            {day === todayDate && (
              <div className="mt-0.5 flex gap-px">
                <span className="block size-1 rounded-full bg-primary" />
                <span className="block size-1 rounded-full bg-accent-foreground/40" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HerCalendarPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Calendar Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>美食日曆</CardTitle>
              <CardDescription>點選日期規劃三餐</CardDescription>
            </div>
            <Badge>可編輯</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CalendarPreview />
        </CardContent>
      </Card>

      {/* Today's meals */}
      <Card>
        <CardHeader>
          <CardTitle>今日三餐</CardTitle>
          <CardDescription>尚未規劃 — S4 開放編輯</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {["🌅 早餐", "☀️ 午餐", "🌙 晚餐"].map((meal) => (
              <div key={meal} className="flex items-center gap-3">
                <span className="text-sm">{meal}</span>
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
