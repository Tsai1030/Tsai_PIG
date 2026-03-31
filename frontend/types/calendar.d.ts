export type MealType = "breakfast" | "lunch" | "dinner";

export interface MealPlan {
  id: string;
  plan_date: string; // "YYYY-MM-DD"
  meal_type: MealType;
  restaurant_name: string;
  address: string;
  note: string | null;
  created_at: string;
}

export interface MealPlanCreate {
  plan_date: string; // "YYYY-MM-DD"
  meal_type: MealType;
  restaurant_name: string;
  address: string;
  note?: string;
}

/** 以日期字串為 key，每天三餐的 map */
export type DayMealsMap = Record<string, Partial<Record<MealType, MealPlan>>>;
