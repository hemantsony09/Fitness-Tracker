// Import Firebase Realtime Database API for logs and planner
import { firebaseApi } from './firebaseApi';
// Import hardcoded exercises
import { mockExercises } from './mockData';

// Exercises are hardcoded, not stored in Firebase
// Only workout logs and weekly plans are stored in Firebase
export const api = {
  exercises: {
    get: async (): Promise<Exercise[]> => {
      // Return hardcoded exercises
      return Promise.resolve(mockExercises);
    },
    getById: async (id: string): Promise<Exercise | null> => {
      // Find exercise in hardcoded list
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
  // Workout logs and planner are stored in Firebase
  logs: firebaseApi.logs,
  planner: firebaseApi.planner,
  // Auth is handled by Firebase Auth directly, no API needed
  auth: {
    login: async (): Promise<never> => {
      throw new Error('Use Firebase Auth directly');
    },
    register: async (): Promise<never> => {
      throw new Error('Use Firebase Auth directly');
    },
    googleLogin: async (): Promise<never> => {
      throw new Error('Use Firebase Auth directly');
    },
    logout: async (): Promise<void> => {
      // Handled by Firebase Auth
    },
  },
};

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

