import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type WorkoutLog } from '@/lib/api';

export function useWorkoutLogs() {
  return useQuery({
    queryKey: ['workoutLogs'],
    queryFn: () => api.logs.get(),
  });
}

export function useWorkoutLogByDate(date: string) {
  return useQuery({
    queryKey: ['workoutLogs', date],
    queryFn: () => api.logs.getByDate(date),
    enabled: !!date,
  });
}

export function useCreateWorkoutLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (log: Omit<WorkoutLog, 'id' | 'createdAt'>) => api.logs.add(log),
    onSuccess: (data) => {
      // Invalidate all workout logs queries
      queryClient.invalidateQueries({ queryKey: ['workoutLogs'] });
      // Specifically invalidate the date query
      queryClient.invalidateQueries({ queryKey: ['workoutLogs', data.date] });
      // Also set the data directly for immediate UI update
      queryClient.setQueryData(['workoutLogs', data.date], data);
    },
  });
}

export function useUpdateWorkoutLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, log }: { id: string; log: Partial<WorkoutLog> }) =>
      api.logs.update(id, log),
    onSuccess: (data) => {
      // Invalidate all workout logs queries
      queryClient.invalidateQueries({ queryKey: ['workoutLogs'] });
      // Specifically invalidate the date query
      queryClient.invalidateQueries({ queryKey: ['workoutLogs', data.date] });
      // Also set the data directly for immediate UI update
      queryClient.setQueryData(['workoutLogs', data.date], data);
    },
  });
}

export function useDeleteWorkoutLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.logs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutLogs'] });
    },
  });
}

