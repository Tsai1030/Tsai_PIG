"use client";

import { MapPinIcon, StickyNoteIcon, UtensilsIcon } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { DayMealsMap, MealType } from "@/types/calendar";

const MEALS: { type: MealType; label: string }[] = [
  { type: "breakfast", label: "🌅 早餐" },
  { type: "lunch", label: "☀️ 午餐" },
  { type: "dinner", label: "🌙 晚餐" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  dateStr: string;
  mealsMap: DayMealsMap;
}

export function DayDetailDrawer({ open, onClose, dateStr, mealsMap }: Props) {
  const [year, month, day] = dateStr.split("-");
  const title = `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
  const dayMeals = mealsMap[dateStr] ?? {};
  const hasAny = MEALS.some(({ type }) => !!dayMeals[type]);

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>公主規劃的三餐</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-3 px-4 pb-6">
          {!hasAny && (
            <p className="text-sm text-muted-foreground text-center py-4">
              今天還沒有規劃，等公主決定吧 👸
            </p>
          )}
          {MEALS.map(({ type, label }, idx) => {
            const meal = dayMeals[type];
            if (!meal) return null;
            return (
              <div key={type}>
                {idx > 0 && <Separator />}
                <div className="flex flex-col gap-1 py-2">
                  <span className="text-sm font-medium">{label}</span>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <UtensilsIcon className="mt-0.5 shrink-0 size-4" />
                    <span>{meal.restaurant_name}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPinIcon className="mt-0.5 shrink-0 size-4" />
                    <span>{meal.address}</span>
                  </div>
                  {meal.note && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <StickyNoteIcon className="mt-0.5 shrink-0 size-4" />
                      <span>{meal.note}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
