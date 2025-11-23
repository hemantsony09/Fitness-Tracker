// Import Firebase Realtime Database API for logs and planner
import { firebaseApi } from './firebaseApi';
import { localStorageApi } from './localStorageApi';
// Import hardcoded exercises
import { mockExercises } from './mockData';

// Helper to determine if user is in guest mode (dynamic check)
function isGuestMode(): boolean {
  if (typeof window === 'undefined') return false;
  const authState = localStorage.getItem('fitness_tracker_auth');
  if (!authState) return false;
  try {
    const parsed = JSON.parse(authState);
    return parsed.user?.id === 'guest';
  } catch {
    return false;
  }
}

// Create dynamic API that checks guest mode on each call
const createApi = () => ({
  exercises: {
    get: async (): Promise<Exercise[]> => {
      return Promise.resolve(mockExercises);
    },
    getById: async (id: string): Promise<Exercise | null> => {
      const exercise = mockExercises.find(e => e.id === id);
      return Promise.resolve(exercise || null);
    },
    create: async (): Promise<never> => {
      throw new Error('Exercises are hardcoded and cannot be created');
    },
    update: async (): Promise<never> => {
      throw new Error('Exercises are hardcoded and cannot be updated');
    },
    delete: async (): Promise<never> => {
      throw new Error('Exercises are hardcoded and cannot be deleted');
    },
  },
  // Workout logs and planner: use localStorage for guests, Firebase for authenticated users
  logs: {
    get: async () => {
      return isGuestMode() ? localStorageApi.logs.get() : firebaseApi.logs.get();
    },
    getByDate: async (date: string) => {
      return isGuestMode() ? localStorageApi.logs.getByDate(date) : firebaseApi.logs.getByDate(date);
    },
    add: async (log: Omit<WorkoutLog, 'id' | 'createdAt'>) => {
      return isGuestMode() ? localStorageApi.logs.add(log) : firebaseApi.logs.add(log);
    },
    update: async (id: string, log: Partial<WorkoutLog>) => {
      return isGuestMode() ? localStorageApi.logs.update(id, log) : firebaseApi.logs.update(id, log);
    },
    delete: async (id: string) => {
      return isGuestMode() ? localStorageApi.logs.delete(id) : firebaseApi.logs.delete(id);
    },
  },
  planner: {
    get: async () => {
      return isGuestMode() ? localStorageApi.planner.get() : firebaseApi.planner.get();
    },
    update: async (plan: WeeklyPlan) => {
      return isGuestMode() ? localStorageApi.planner.update(plan) : firebaseApi.planner.update(plan);
    },
  },
});

export const api = createApi();

// Types
export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'other';
  muscleGroups?: string[];
  description?: string;
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: Set[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  exercises: ExerciseEntry[];
  duration?: number;
  notes?: string;
  createdAt: string;
}

export interface WeeklyPlan {
  [day: string]: {
    exercises: Array<{
      id: string;
      exerciseId: string;
      exerciseName: string;
      order: number;
    }>;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
}

