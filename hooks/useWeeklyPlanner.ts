import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type WeeklyPlan } from '@/lib/api';

export function useWeeklyPlanner() {
  return useQuery({
    queryKey: ['weeklyPlanner'],
    queryFn: () => api.planner.get(),
  });
}

export function useUpdateWeeklyPlanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plan: WeeklyPlan) => api.planner.update(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyPlanner'] });
    },
  });
}

