import { createQuery, useQueryClient } from '@tanstack/svelte-query';
import { authService, type UserProfile } from '#lib/services/auth.js';
import { authStore } from '#lib/stores/auth.svelte.js';

export const USER_PROFILE_KEY = ['user', 'profile'] as const;

export function useUserProfile() {
	return createQuery<UserProfile, Error>(() => ({
		queryKey: USER_PROFILE_KEY,
		queryFn: () => authService.getUserProfile(),
		enabled: authStore.isAuthenticated,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 1
	}));
}

export function useInvalidateUserProfile() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: USER_PROFILE_KEY });
	};
}
