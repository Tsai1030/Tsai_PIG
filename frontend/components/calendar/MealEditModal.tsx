"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon, Trash2Icon, XIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useDeleteMealPlan, useUpsertMealPlan } from "@/hooks/useCalendar";
import type { DayMealsMap, MealType } from "@/types/calendar";

const MEALS: { type: MealType; label: string; emoji: string }[] = [
  { type: "breakfast", label: "早餐", emoji: "🌅" },
  { type: "lunch", label: "午餐", emoji: "☀️" },
  { type: "dinner", label: "晚餐", emoji: "🌙" },
];

interface MealForm {
  restaurant_name: string;
  address: string;
  note: string;
}

const EMPTY_FORM: MealForm = { restaurant_name: "", address: "", note: "" };

interface Props {
  open: boolean;
  onClose: () => void;
  dateStr: string;
  mealsMap: DayMealsMap;
}

export function MealEditModal({ open, onClose, dateStr, mealsMap }: Props) {
  const upsert = useUpsertMealPlan();
  const deleteMeal = useDeleteMealPlan();

  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [form, setForm] = useState<MealForm>(EMPTY_FORM);

  const dayMeals = mealsMap[dateStr] ?? {};
  const [year, month, day] = dateStr.split("-");
  const dateTitle = `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
  const isPending = upsert.isPending || deleteMeal.isPending;

  useEffect(() => {
    if (!open) {
      setSelectedMeal(null);
      setForm(EMPTY_FORM);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSelectMeal(type: MealType) {
    const existing = dayMeals[type];
    setForm({
      restaurant_name: existing?.restaurant_name ?? "",
      address: existing?.address ?? "",
      note: existing?.note ?? "",
    });
    setSelectedMeal(type);
  }

  async function handleSave() {
    if (!selectedMeal || !form.restaurant_name.trim() || !form.address.trim()) return;
    await upsert.mutateAsync({
      plan_date: dateStr,
      meal_type: selectedMeal,
      restaurant_name: form.restaurant_name.trim(),
      address: form.address.trim(),
      note: form.note.trim() || undefined,
    });
    setSelectedMeal(null);
    setForm(EMPTY_FORM);
  }

  async function handleDelete() {
    if (!selectedMeal) return;
    const existing = dayMeals[selectedMeal];
    if (!existing) return;
    await deleteMeal.mutateAsync({ id: existing.id, plan_date: dateStr });
    setSelectedMeal(null);
    setForm(EMPTY_FORM);
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
          className="absolute top-4 right-4 z-10 size-9 rounded-full glass-kawaii flex items-center justify-center text-white hover:scale-110 transition"
        >
          <XIcon className="size-4" />
        </button>

        <div className="p-7">
          {!selectedMeal ? (
            <>
              <p className="font-display italic text-[var(--kawaii-glow)]" style={{ fontSize: 13 }}>
                Plan your day
              </p>
              <h2 className="font-serif font-black text-white mt-1 mb-6" style={{ fontSize: 22 }}>
                {dateTitle}
              </h2>
              <div className="flex gap-2">
                {MEALS.map(({ type, label, emoji }) => {
                  const meal = dayMeals[type];
                  return (
                    <button
                      key={type}
                      onClick={() => handleSelectMeal(type)}
                      className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl px-2 py-4 transition-all hover:scale-105"
                      style={{
                        background: meal
                          ? "linear-gradient(135deg, var(--primary), var(--kawaii-mid))"
                          : "oklch(1 0 0 / 0.10)",
                        border: meal
                          ? "1px solid var(--kawaii-glow)"
                          : "1px solid oklch(1 0 0 / 0.20)",
                        boxShadow: meal ? "0 8px 24px var(--primary)" : "none",
                      }}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-xs font-bold text-white">{label}</span>
                      {meal ? (
                        <span className="w-full truncate text-center text-[10px] text-white/85 leading-tight px-1">
                          {meal.restaurant_name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/45">未規劃</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-5">
                <button
                  onClick={() => { setSelectedMeal(null); setForm(EMPTY_FORM); }}
                  disabled={isPending}
                  className="size-8 rounded-full glass-kawaii flex items-center justify-center text-white hover:scale-110 transition"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                <div>
                  <p className="font-display italic text-[var(--kawaii-glow)]" style={{ fontSize: 12 }}>
                    {dateTitle}
                  </p>
                  <h2 className="font-serif font-bold text-white" style={{ fontSize: 18 }}>
                    {MEALS.find((m) => m.type === selectedMeal)?.emoji} {MEALS.find((m) => m.type === selectedMeal)?.label}
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <p className="font-serif font-bold text-white/80 text-sm mb-1.5">餐廳名稱</p>
                  <input
                    placeholder="例：鼎泰豐"
                    value={form.restaurant_name}
                    onChange={(e) => setForm((p) => ({ ...p, restaurant_name: e.target.value }))}
                    className={cn(inputClass)}
                  />
                </label>
                <label className="block">
                  <p className="font-serif font-bold text-white/80 text-sm mb-1.5">地址</p>
                  <input
                    placeholder="例：台北市信義區..."
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    className={cn(inputClass)}
                  />
                </label>
                <label className="block">
                  <p className="font-serif font-bold text-white/80 text-sm mb-1.5">備註（選填）</p>
                  <input
                    placeholder="訂位電話、注意事項..."
                    value={form.note}
                    onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                    className={cn(inputClass)}
                  />
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                {dayMeals[selectedMeal] && (
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="px-4 py-3 rounded-full font-bold flex items-center gap-2 transition hover:scale-105 disabled:opacity-50"
                    style={{
                      background: "oklch(0.65 0.20 25 / 0.2)",
                      color: "oklch(0.85 0.20 25)",
                      border: "1px solid oklch(0.65 0.20 25 / 0.4)",
                    }}
                  >
                    {deleteMeal.isPending ? <Spinner className="size-4" /> : <Trash2Icon className="size-4" />}
                    刪除
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isPending || !form.restaurant_name.trim() || !form.address.trim()}
                  className="btn-kawaii flex-1 flex items-center justify-center gap-2"
                >
                  {upsert.isPending && <Spinner className="size-4" />}
                  儲存
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass = "w-full px-4 py-3 rounded-2xl bg-white/10 text-white border border-white/20 outline-none focus:border-white/50 transition placeholder:text-white/35";
