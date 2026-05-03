"use client";

import { useEffect, useState } from "react";
import { CalendarPlusIcon, XIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useUpsertMealPlan } from "@/hooks/useCalendar";
import { cn } from "@/lib/utils";
import type { Favorite } from "@/types/favorite";
import type { MealType } from "@/types/calendar";

const MEAL_OPTIONS: { type: MealType; label: string; emoji: string }[] = [
  { type: "breakfast", label: "早餐", emoji: "🌅" },
  { type: "lunch", label: "午餐", emoji: "☀️" },
  { type: "dinner", label: "晚餐", emoji: "🌙" },
];

const TODAY = new Date().toISOString().split("T")[0];

interface Props {
  fav: Favorite | null;
  onClose: () => void;
}

export function AddToCalendarModal({ fav, onClose }: Props) {
  const upsert = useUpsertMealPlan();
  const [date, setDate] = useState(TODAY);
  const [mealType, setMealType] = useState<MealType | null>(null);

  useEffect(() => {
    if (!fav) {
      setDate(TODAY);
      setMealType(null);
    }
  }, [fav]);

  useEffect(() => {
    if (!fav) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [fav, onClose]);

  if (!fav) return null;

  async function handleSave() {
    if (!fav || !mealType || !date) return;
    await upsert.mutateAsync({
      plan_date: date,
      meal_type: mealType,
      restaurant_name: fav.restaurant_name,
      address: fav.address,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bubble-in"
      style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, oklch(0.34 0.10 295), oklch(0.24 0.07 295))",
          border: "1px solid oklch(1 0 0 / 0.18)",
          boxShadow: "var(--shadow-2xl)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 size-9 rounded-full glass-kawaii flex items-center justify-center text-white hover:scale-110 transition"
        >
          <XIcon className="size-4" />
        </button>

        <div className="p-7">
          <div className="flex items-center gap-2 mb-5">
            <CalendarPlusIcon className="size-5 text-[var(--kawaii-glow)]" />
            <p className="font-display italic text-[var(--kawaii-glow)]" style={{ fontSize: 14 }}>
              Add to Calendar
            </p>
          </div>
          <h2 className="font-serif font-black text-white mb-1 line-clamp-1" style={{ fontSize: 24 }}>
            {fav.restaurant_name}
          </h2>
          <p className="font-serif text-white/70 text-sm mb-6 line-clamp-1">{fav.address}</p>

          {/* Date picker */}
          <label className="block">
            <p className="font-serif font-bold text-white/80 text-sm mb-2">日期</p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white border border-white/20 outline-none focus:border-white/50 transition"
              style={{ colorScheme: "dark" }}
            />
          </label>

          {/* Meal type */}
          <div className="mt-5">
            <p className="font-serif font-bold text-white/80 text-sm mb-2">餐別</p>
            <div className="flex gap-2">
              {MEAL_OPTIONS.map(({ type, label, emoji }) => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-2xl border px-2 py-4 text-sm font-bold transition-all",
                    mealType === type
                      ? "text-white scale-105"
                      : "text-white/70 hover:text-white border-white/20 bg-white/5"
                  )}
                  style={
                    mealType === type
                      ? {
                          background:
                            "linear-gradient(135deg, var(--primary), var(--kawaii-mid))",
                          borderColor: "var(--kawaii-glow)",
                          boxShadow: "0 8px 24px var(--primary)",
                        }
                      : undefined
                  }
                >
                  <span className="text-2xl">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={upsert.isPending}
              className="btn-kawaii-ghost flex-1"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={upsert.isPending || !mealType || !date}
              className="btn-kawaii flex-1 flex items-center justify-center gap-2"
            >
              {upsert.isPending && <Spinner className="size-4" />}
              加入日曆
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
