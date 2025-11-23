import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Exercise } from '@/lib/api';

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: () => api.exercises.get(),
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ['exercises', id],
    queryFn: () => api.exercises.getById(id),
    enabled: !!id,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_exercise: Omit<Exercise, 'id'>) => {
      throw new Error('Exercises are hardcoded and cannot be created');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { id: string; exercise: Partial<Exercise> }) => {
      throw new Error('Exercises are hardcoded and cannot be updated');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercises', variables.id] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_id: string) => {
      throw new Error('Exercises are hardcoded and cannot be deleted');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

