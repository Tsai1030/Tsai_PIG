import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import { DayMealsMap, MealPlan, MealPlanCreate } from "@/types/calendar";

function buildDayMealsMap(plans: MealPlan[]): DayMealsMap {
  const map: DayMealsMap = {};
  for (const plan of plans) {
    if (!map[plan.plan_date]) map[plan.plan_date] = {};
    map[plan.plan_date][plan.meal_type] = plan;
  }
  return map;
}

export function useCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ["calendar", year, month],
    queryFn: async () => {
      const { data } = await api.get<MealPlan[]>("/api/calendar", {
        params: { year, month },
      });
      return buildDayMealsMap(data);
    },
  });
}

export function useUpsertMealPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MealPlanCreate) =>
      api.put<MealPlan>("/api/calendar", payload).then((r) => r.data),
    onSuccess: (data) => {
      const [yearStr, monthStr] = data.plan_date.split("-");
      queryClient.invalidateQueries({
        queryKey: ["calendar", Number(yearStr), Number(monthStr)],
      });
    },
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plan_date }: { id: string; plan_date: string }) =>
      api.delete(`/api/calendar/${id}`).then(() => plan_date),
    onSuccess: (plan_date) => {
      const [yearStr, monthStr] = plan_date.split("-");
      queryClient.invalidateQueries({
        queryKey: ["calendar", Number(yearStr), Number(monthStr)],
      });
    },
  });
}
