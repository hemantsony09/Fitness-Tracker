import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localStorageApi, type UserProfile } from '@/lib/localStorageApi';

export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profile = await localStorageApi.profile.get();
      // Return default profile if none exists
      if (!profile) {
        return {
          weight: 70, // kg
          height: 170, // cm
          age: 25,
          gender: 'male' as const,
        };
      }
      return profile;
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Partial<UserProfile>) => {
      return await localStorageApi.profile.update(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

