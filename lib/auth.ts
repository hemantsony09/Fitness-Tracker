// Auth utilities for managing authentication state

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'fitness_tracker_auth';

export const authStorage = {
  get: (): AuthState | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  set: (state: AuthState): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth state:', error);
    }
  },
};

export function getInitialAuthState(): AuthState {
  const stored = authStorage.get();
  return stored || {
    user: null,
    token: null,
    isAuthenticated: false,
  };
}

