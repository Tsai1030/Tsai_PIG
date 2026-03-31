"use client";

import { useEffect, useState } from "react";
import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteMealPlan, useUpsertMealPlan } from "@/hooks/useCalendar";
import { DayMealsMap, MealType } from "@/types/calendar";

const MEALS: { type: MealType; label: string }[] = [
  { type: "breakfast", label: "🌅 早餐" },
  { type: "lunch", label: "☀️ 午餐" },
  { type: "dinner", label: "🌙 晚餐" },
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
  dateStr: string; // "YYYY-MM-DD"
  mealsMap: DayMealsMap;
}

export function MealEditModal({ open, onClose, dateStr, mealsMap }: Props) {
  const upsert = useUpsertMealPlan();
  const deleteMeal = useDeleteMealPlan();

  const [forms, setForms] = useState<Record<MealType, MealForm>>({
    breakfast: EMPTY_FORM,
    lunch: EMPTY_FORM,
    dinner: EMPTY_FORM,
  });

  // Sync form state when dateStr changes or modal opens
  useEffect(() => {
    if (!open) return;
    const dayMeals = mealsMap[dateStr] ?? {};
    setForms({
      breakfast: {
        restaurant_name: dayMeals.breakfast?.restaurant_name ?? "",
        address: dayMeals.breakfast?.address ?? "",
        note: dayMeals.breakfast?.note ?? "",
      },
      lunch: {
        restaurant_name: dayMeals.lunch?.restaurant_name ?? "",
        address: dayMeals.lunch?.address ?? "",
        note: dayMeals.lunch?.note ?? "",
      },
      dinner: {
        restaurant_name: dayMeals.dinner?.restaurant_name ?? "",
        address: dayMeals.dinner?.address ?? "",
        note: dayMeals.dinner?.note ?? "",
      },
    });
  }, [open, dateStr, mealsMap]);

  function updateField(type: MealType, field: keyof MealForm, value: string) {
    setForms((prev) => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  }

  async function handleSave(type: MealType) {
    const form = forms[type];
    if (!form.restaurant_name.trim() || !form.address.trim()) return;
    await upsert.mutateAsync({
      plan_date: dateStr,
      meal_type: type,
      restaurant_name: form.restaurant_name.trim(),
      address: form.address.trim(),
      note: form.note.trim() || undefined,
    });
  }

  async function handleDelete(type: MealType) {
    const existing = mealsMap[dateStr]?.[type];
    if (!existing) return;
    await deleteMeal.mutateAsync({ id: existing.id, plan_date: dateStr });
    setForms((prev) => ({ ...prev, [type]: EMPTY_FORM }));
  }

  const [year, month, day] = dateStr.split("-");
  const title = `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
  const isPending = upsert.isPending || deleteMeal.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {MEALS.map(({ type, label }, idx) => {
            const existing = mealsMap[dateStr]?.[type];
            const form = forms[type];
            return (
              <div key={type}>
                {idx > 0 && <Separator className="mb-4" />}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{label}</span>
                  {existing && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(type)}
                      disabled={isPending}
                    >
                      <Trash2Icon data-icon />
                      <span className="sr-only">刪除</span>
                    </Button>
                  )}
                </div>
                <FieldGroup>
                  <Field>
                    <FieldLabel>餐廳名稱</FieldLabel>
                    <Input
                      placeholder="例：鼎泰豐"
                      value={form.restaurant_name}
                      onChange={(e) => updateField(type, "restaurant_name", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>地址</FieldLabel>
                    <Input
                      placeholder="例：台北市信義區..."
                      value={form.address}
                      onChange={(e) => updateField(type, "address", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>備註（選填）</FieldLabel>
                    <Input
                      placeholder="訂位電話、注意事項..."
                      value={form.note}
                      onChange={(e) => updateField(type, "note", e.target.value)}
                    />
                  </Field>
                </FieldGroup>
                <Button
                  className="mt-2 w-full"
                  size="sm"
                  onClick={() => handleSave(type)}
                  disabled={isPending || !form.restaurant_name.trim() || !form.address.trim()}
                >
                  {isPending && <Spinner data-icon="inline-start" />}
                  儲存{label.slice(2)}
                </Button>
              </div>
            );
          })}
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
