"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon, PencilIcon, StickyNoteIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useCalendar } from "@/hooks/useCalendar";
import { MealEditModal } from "@/components/calendar/MealEditModal";
import type { UserRole } from "@/types/auth";
import type { MealType } from "@/types/calendar";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const ZH_MONTH = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const EN_MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const MEAL_INFO: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: "早餐", emoji: "🌅" },
  lunch: { label: "午餐", emoji: "☀️" },
  dinner: { label: "晚餐", emoji: "🌙" },
};

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarView({ role }: { role: UserRole }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [editOpen, setEditOpen] = useState(false);

  const { data: mealsMap = {}, isLoading } = useCalendar(year, month);

  const canEdit = role === "her";
  const accent = role === "her" ? "var(--kawaii-her)" : "var(--kawaii-him)";
  const accentDark = role === "her" ? "var(--kawaii-her-dark)" : "var(--kawaii-him-dark)";
  const accentLight = role === "her" ? "var(--kawaii-glow)" : "oklch(0.85 0.07 260)";

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const isThisMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  const selectedStr = toDateStr(year, month, selectedDay);
  const selectedMeals = mealsMap[selectedStr] ?? {};
  const selectedMealCount = Object.keys(selectedMeals).length;

  const upcoming = Object.entries(mealsMap)
    .filter(([date]) => date >= selectedStr)
    .sort()
    .slice(0, 4);

  function navigate(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setYear(y);
    setMonth(m);
    setSelectedDay(1);
  }

  const cells: ({ blank: true; key: string } | { blank: false; day: number })[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ blank: true, key: `b${i}` });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ blank: false, day: d });

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-display italic" style={{ color: accent, fontSize: 16 }}>— Sweet Days —</p>
            <h1 className="font-serif font-black text-glow text-white mt-1" style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1 }}>
              {ZH_MONTH[month - 1]}
            </h1>
            <p className="font-display italic mt-1 text-white/50" style={{ fontSize: 18 }}>
              {EN_MONTH[month - 1]} · {year}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="size-11 rounded-full glass-kawaii flex items-center justify-center text-white hover:scale-110 transition"
              aria-label="上個月"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="size-11 rounded-full glass-kawaii flex items-center justify-center text-white hover:scale-110 transition"
              aria-label="下個月"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            {/* Calendar */}
            <div>
              <div className="grid grid-cols-7 gap-1.5 mb-2 font-display tracking-widest text-xs" style={{ color: accentLight }}>
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center py-2 font-bold">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((c) =>
                  c.blank ? (
                    <div key={c.key} className="cal-cell muted" />
                  ) : (
                    <button
                      key={c.day}
                      onClick={() => setSelectedDay(c.day)}
                      className="cal-cell glass-kawaii"
                      data-has-event={!!mealsMap[toDateStr(year, month, c.day)] || undefined}
                      style={{
                        background:
                          selectedDay === c.day
                            ? `linear-gradient(135deg, ${accent}, ${accentDark})`
                            : isThisMonth && c.day === today.getDate()
                              ? "oklch(1 0 0 / 0.18)"
                              : undefined,
                        color: "white",
                        boxShadow:
                          selectedDay === c.day ? `0 8px 24px ${accent}80` : undefined,
                        position: "relative",
                      }}
                    >
                      <span style={{ fontSize: 17, fontWeight: 700 }}>{c.day}</span>
                      {mealsMap[toDateStr(year, month, c.day)] && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: 8,
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: selectedDay === c.day ? "white" : "var(--kawaii-pink)",
                            boxShadow: "0 0 8px var(--kawaii-pink)",
                          }}
                        />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Detail panel */}
            <aside className="lg:sticky lg:top-24 self-start space-y-4">
              <div className="glass-kawaii rounded-3xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-display italic" style={{ color: accent, fontSize: 13 }}>
                      {ZH_MONTH[month - 1]} {selectedDay}, {year}
                    </p>
                    <h3 className="font-serif font-bold text-white mt-1" style={{ fontSize: 26 }}>
                      {selectedMealCount === 0 ? "空白的一天" : `${selectedMealCount} 餐已規劃`}
                    </h3>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => setEditOpen(true)}
                      className="btn-kawaii !p-3 !rounded-full"
                      title="編輯"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                  )}
                </div>

                {selectedMealCount === 0 ? (
                  <div className="text-center py-6">
                    <Image
                      src="/cute-pic.png"
                      alt=""
                      width={140}
                      height={140}
                      className="mx-auto float-y"
                      style={{ height: 110, width: "auto" }}
                    />
                    <p className="font-serif text-white/60 mt-3 text-sm">
                      {canEdit ? "這天還沒有計畫" : "等待公主規劃"}
                    </p>
                    {canEdit && (
                      <button onClick={() => setEditOpen(true)} className="btn-kawaii mt-3 text-sm" style={{ padding: "8px 18px" }}>
                        + 加一個
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(["breakfast", "lunch", "dinner"] as MealType[]).map((type) => {
                      const meal = selectedMeals[type];
                      if (!meal) return null;
                      const info = MEAL_INFO[type];
                      return (
                        <div
                          key={type}
                          className="rounded-2xl p-4"
                          style={{
                            background: `linear-gradient(135deg, ${accent}30, ${accentDark}30)`,
                            border: `1px solid ${accentLight}40`,
                          }}
                        >
                          <p className="font-display italic" style={{ color: accentLight, fontSize: 12 }}>
                            {info.emoji} {info.label}
                          </p>
                          <p className="font-serif font-bold text-white mt-1" style={{ fontSize: 16 }}>
                            {meal.restaurant_name}
                          </p>
                          <p className="font-serif text-white/70 mt-0.5 text-xs flex items-start gap-1.5">
                            <MapPinIcon className="size-3 mt-0.5 shrink-0" />
                            <span>{meal.address}</span>
                          </p>
                          {meal.note && (
                            <p className="font-serif text-white/65 mt-1.5 text-xs flex items-start gap-1.5">
                              <StickyNoteIcon className="size-3 mt-0.5 shrink-0" />
                              <span>{meal.note}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upcoming */}
              {upcoming.length > 0 && (
                <div className="glass-kawaii rounded-3xl p-5">
                  <p className="font-display italic mb-3" style={{ color: accent, fontSize: 12, letterSpacing: "0.2em" }}>
                    UPCOMING
                  </p>
                  <div className="space-y-2.5">
                    {upcoming.map(([dateStr, meals]) => {
                      const day = Number(dateStr.split("-")[2]);
                      const firstMeal = Object.values(meals)[0];
                      if (!firstMeal) return null;
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDay(day)}
                          className="w-full text-left flex items-center gap-3 py-1 hover:opacity-80"
                        >
                          <div
                            className="font-display font-black shrink-0"
                            style={{ color: accentLight, fontSize: 28, lineHeight: 1, minWidth: 36 }}
                          >
                            {String(day).padStart(2, "0")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-serif font-bold text-white text-sm truncate">
                              {firstMeal.restaurant_name}
                            </p>
                            <p className="font-serif text-white/55 text-xs">
                              {MEAL_INFO[firstMeal.meal_type].emoji} {MEAL_INFO[firstMeal.meal_type].label}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      {canEdit && (
        <MealEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          dateStr={selectedStr}
          mealsMap={mealsMap}
        />
      )}
    </div>
  );
}
