"use client";

import { useState } from "react";
import { CalendarPlusIcon } from "lucide-react";

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
import { useUpsertMealPlan } from "@/hooks/useCalendar";
import { Favorite } from "@/types/favorite";
import { MealType } from "@/types/calendar";

const MEAL_OPTIONS: { type: MealType; label: string; emoji: string; color: string }[] = [
  { type: "breakfast", label: "早餐", emoji: "🌅", color: "border-amber-300 bg-amber-50 text-amber-800 data-[selected=true]:bg-amber-100 data-[selected=true]:border-amber-400" },
  { type: "lunch",     label: "午餐", emoji: "☀️", color: "border-emerald-300 bg-emerald-50 text-emerald-800 data-[selected=true]:bg-emerald-100 data-[selected=true]:border-emerald-400" },
  { type: "dinner",    label: "晚餐", emoji: "🌙", color: "border-violet-300 bg-violet-50 text-violet-800 data-[selected=true]:bg-violet-100 data-[selected=true]:border-violet-400" },
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

  function handleClose() {
    setDate(TODAY);
    setMealType(null);
    onClose();
  }

  async function handleSave() {
    if (!fav || !mealType || !date) return;
    await upsert.mutateAsync({
      plan_date: date,
      meal_type: mealType,
      restaurant_name: fav.restaurant_name,
      address: fav.address,
    });
    handleClose();
  }

  return (
    <Dialog open={!!fav} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlusIcon className="size-4 text-blue-500" />
            加入日曆
          </DialogTitle>
        </DialogHeader>

        {fav && (
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <p className="font-medium line-clamp-1">{fav.restaurant_name}</p>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{fav.address}</p>
          </div>
        )}

        <FieldGroup>
          <Field>
            <FieldLabel>日期</FieldLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>餐別</FieldLabel>
            <div className="flex gap-2">
              {MEAL_OPTIONS.map(({ type, label, emoji, color }) => (
                <button
                  key={type}
                  data-selected={mealType === type}
                  onClick={() => setMealType(type)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-all duration-150",
                    color
                  )}
                >
                  <span className="text-lg">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </Field>
        </FieldGroup>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleClose} disabled={upsert.isPending}>
            取消
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={upsert.isPending || !mealType || !date}
          >
            {upsert.isPending && <Spinner data-icon="inline-start" />}
            加入
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
