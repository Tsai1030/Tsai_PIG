"use client";

import { useState } from "react";
import { ChevronLeftIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useDeleteMealPlan, useUpsertMealPlan } from "@/hooks/useCalendar";
import { DayMealsMap, MealType } from "@/types/calendar";

const MEALS = [
  {
    type: "breakfast" as MealType,
    label: "早餐",
    emoji: "🌅",
    card: "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800",
    dot: "bg-amber-400",
  },
  {
    type: "lunch" as MealType,
    label: "午餐",
    emoji: "☀️",
    card: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-400",
  },
  {
    type: "dinner" as MealType,
    label: "晚餐",
    emoji: "🌙",
    card: "border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-800",
    dot: "bg-violet-400",
  },
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
  const selected = MEALS.find((m) => m.type === selectedMeal);

  function handleSelectMeal(type: MealType) {
    const existing = dayMeals[type];
    setForm({
      restaurant_name: existing?.restaurant_name ?? "",
      address: existing?.address ?? "",
      note: existing?.note ?? "",
    });
    setSelectedMeal(type);
  }

  function handleBack() {
    setSelectedMeal(null);
    setForm(EMPTY_FORM);
  }

  function handleClose() {
    setSelectedMeal(null);
    setForm(EMPTY_FORM);
    onClose();
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
    handleBack();
  }

  async function handleDelete() {
    if (!selectedMeal) return;
    const existing = dayMeals[selectedMeal];
    if (!existing) return;
    await deleteMeal.mutateAsync({ id: existing.id, plan_date: dateStr });
    handleBack();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        {!selectedMeal ? (
          /* ── Step 1: 選擇餐別 ── */
          <>
            <DialogHeader>
              <DialogTitle>{dateTitle}</DialogTitle>
            </DialogHeader>

            <div className="flex gap-2 pt-1">
              {MEALS.map(({ type, label, emoji, card, dot }) => {
                const meal = dayMeals[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleSelectMeal(type)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 px-2 py-4 transition-colors",
                      card
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs font-semibold">{label}</span>
                    {meal ? (
                      <>
                        <span
                          className={cn("size-1.5 rounded-full", dot)}
                        />
                        <span className="w-full truncate text-center text-[10px] opacity-70 leading-tight">
                          {meal.restaurant_name}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] opacity-40">未規劃</span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* ── Step 2: 填寫餐廳資訊 ── */
          <>
            <DialogHeader>
              <div className="flex items-center gap-1 pr-6">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleBack}
                  className="-ml-1 shrink-0"
                  disabled={isPending}
                >
                  <ChevronLeftIcon data-icon />
                </Button>
                <DialogTitle className="truncate text-sm">
                  {selected?.emoji} {selected?.label} · {dateTitle}
                </DialogTitle>
              </div>
            </DialogHeader>

            <FieldGroup>
              <Field>
                <FieldLabel>餐廳名稱</FieldLabel>
                <Input
                  placeholder="例：鼎泰豐"
                  value={form.restaurant_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, restaurant_name: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>地址</FieldLabel>
                <Input
                  placeholder="例：台北市信義區..."
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>備註（選填）</FieldLabel>
                <Input
                  placeholder="訂位電話、注意事項..."
                  value={form.note}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, note: e.target.value }))
                  }
                />
              </Field>
            </FieldGroup>

            <div className="flex gap-2">
              {dayMeals[selectedMeal] && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-destructive hover:text-destructive"
                >
                  {isPending ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <Trash2Icon data-icon="inline-start" />
                  )}
                  刪除
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={
                  isPending ||
                  !form.restaurant_name.trim() ||
                  !form.address.trim()
                }
              >
                {isPending && <Spinner data-icon="inline-start" />}
                儲存
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
