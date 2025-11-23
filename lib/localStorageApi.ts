// LocalStorage-based API for guest mode
import type { WorkoutLog, WeeklyPlan } from './api';

const STORAGE_KEYS = {
  WORKOUT_LOGS: 'fitness_tracker_workout_logs',
  WEEKLY_PLANNER: 'fitness_tracker_weekly_planner',
  USER_PROFILE: 'fitness_tracker_user_profile',
};

export interface UserProfile {
  weight: number; // in kg
  height: number; // in cm
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

export const localStorageApi = {
  // Workout Logs
  logs: {
    get: async (): Promise<WorkoutLog[]> => {
      if (typeof window === 'undefined') return [];
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
        if (!stored) return [];
        const data = JSON.parse(stored);
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
      } catch {
        return [];
      }
    },

    getByDate: async (date: string): Promise<WorkoutLog | null> => {
      const logs = await localStorageApi.logs.get();
      return logs.find(log => log.date === date) || null;
    },

    add: async (log: Omit<WorkoutLog, 'id' | 'createdAt'>): Promise<WorkoutLog> => {
      if (typeof window === 'undefined') {
        throw new Error('localStorage not available');
      }

      // Check if log exists for this date
      const existingLog = await localStorageApi.logs.getByDate(log.date);
      if (existingLog) {
        // Merge exercises
        const mergedExercises = [
          ...(existingLog.exercises || []),
          ...(log.exercises || []),
        ];
        const updatedLog: WorkoutLog = {
          ...existingLog,
          exercises: mergedExercises,
        };
        await localStorageApi.logs.update(existingLog.id, updatedLog);
        return updatedLog;
      }

      // Create new log
      const logs = await localStorageApi.logs.get();
      const newId = Date.now().toString();
      const newLog: WorkoutLog = {
        id: newId,
        ...log,
        createdAt: new Date().toISOString(),
      };

      const data: Record<string, Omit<WorkoutLog, 'id'>> = {};
      logs.forEach(l => {
        data[l.id] = { ...l, id: undefined } as any;
      });
      data[newId] = { ...newLog, id: undefined } as any;

      localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(data));
      return newLog;
    },

    update: async (id: string, log: Partial<WorkoutLog>): Promise<WorkoutLog> => {
      if (typeof window === 'undefined') {
        throw new Error('localStorage not available');
      }

      const logs = await localStorageApi.logs.get();
      const existingLog = logs.find(l => l.id === id);
      if (!existingLog) {
        throw new Error('Workout log not found');
      }

      const updatedLog: WorkoutLog = {
        ...existingLog,
        ...log,
        id,
      };

      const data: Record<string, Omit<WorkoutLog, 'id'>> = {};
      logs.forEach(l => {
        if (l.id === id) {
          data[id] = { ...updatedLog, id: undefined } as any;
        } else {
          data[l.id] = { ...l, id: undefined } as any;
        }
      });

      localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(data));
      return updatedLog;
    },

    delete: async (id: string): Promise<void> => {
      if (typeof window === 'undefined') {
        throw new Error('localStorage not available');
      }

      const logs = await localStorageApi.logs.get();
      const filteredLogs = logs.filter(l => l.id !== id);

      const data: Record<string, Omit<WorkoutLog, 'id'>> = {};
      filteredLogs.forEach(l => {
        data[l.id] = { ...l, id: undefined } as any;
      });

      localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(data));
    },
  },

  // Weekly Planner
  planner: {
    get: async (): Promise<WeeklyPlan> => {
      if (typeof window === 'undefined') return {};
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.WEEKLY_PLANNER);
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    },

    update: async (plan: WeeklyPlan): Promise<WeeklyPlan> => {
      if (typeof window === 'undefined') {
        throw new Error('localStorage not available');
      }
      localStorage.setItem(STORAGE_KEYS.WEEKLY_PLANNER, JSON.stringify(plan));
      return plan;
    },
  },

  // User Profile
  profile: {
    get: async (): Promise<UserProfile | null> => {
      if (typeof window === 'undefined') return null;
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    },

    update: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
      if (typeof window === 'undefined') {
        throw new Error('localStorage not available');
      }
      const current = await localStorageApi.profile.get();
      const updated: UserProfile = {
        weight: 70, // default
        height: 170, // default
        ...current,
        ...profile,
      };
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
      return updated;
    },
  },
};

