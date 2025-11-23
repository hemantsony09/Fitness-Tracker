import { 
  ref, 
  get, 
  set, 
  push, 
  update, 
  remove, 
  query, 
  orderByChild, 
  equalTo,
  onValue,
  off
} from 'firebase/database';
import { database, auth } from './firebase';
import type { WorkoutLog, WeeklyPlan } from './api';

// Helper to get current user ID
function getUserId(): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated. Please sign in first.');
  }
  return user.uid;
}

// Helper to get user data path
function getUserPath(path: string): string {
  const userId = getUserId();
  return `users/${userId}/${path}`;
}

// Only workout logs and weekly plans are stored in Firebase
// Exercises are hardcoded in mockData.ts

// Helper function to get log by date (used internally)
async function getLogByDate(date: string): Promise<WorkoutLog | null> {
  const logsRef = ref(database, getUserPath('workoutLogs'));
  const snapshot = await get(logsRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.val();
  // Find the log with matching date (most recent if multiple exist)
  for (const key in data) {
    if (data[key].date === date) {
      return {
        id: key,
        ...data[key],
      };
    }
  }
  
  return null;
}

export const firebaseApi = {
  logs: {
    get: async (): Promise<WorkoutLog[]> => {
      const logsRef = ref(database, getUserPath('workoutLogs'));
      const snapshot = await get(logsRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));
    },

    getByDate: async (date: string): Promise<WorkoutLog | null> => {
      return getLogByDate(date);
    },

    add: async (log: Omit<WorkoutLog, 'id' | 'createdAt'>): Promise<WorkoutLog> => {
      // Check if a log already exists for this date to prevent duplicates
      const existingLog = await getLogByDate(log.date);
      if (existingLog) {
        // Merge exercises with existing log instead of creating duplicate
        const mergedExercises = [
          ...(existingLog.exercises || []),
          ...(log.exercises || [])
        ];
        // Use update function
        const logRef = ref(database, getUserPath(`workoutLogs/${existingLog.id}`));
        const snapshot = await get(logRef);
        const currentData = snapshot.val();
        await update(logRef, { exercises: mergedExercises });
        return {
          id: existingLog.id,
          ...currentData,
          exercises: mergedExercises,
        };
      }
      
      // Create new log if none exists
      const logsRef = ref(database, getUserPath('workoutLogs'));
      const newLogRef = push(logsRef);
      
      const logData = {
        ...log,
        createdAt: new Date().toISOString(),
      };
      
      await set(newLogRef, logData);
      
      return {
        id: newLogRef.key!,
        ...logData,
      };
    },

    update: async (id: string, log: Partial<WorkoutLog>): Promise<WorkoutLog> => {
      const logRef = ref(database, getUserPath(`workoutLogs/${id}`));
      const snapshot = await get(logRef);
      
      if (!snapshot.exists()) {
        throw new Error('Workout log not found');
      }
      
      const currentData = snapshot.val();
      await update(logRef, log);
      
      return {
        id,
        ...currentData,
        ...log,
      };
    },

    delete: async (id: string): Promise<void> => {
      const logRef = ref(database, getUserPath(`workoutLogs/${id}`));
      await remove(logRef);
    },
  },

  planner: {
    get: async (): Promise<WeeklyPlan> => {
      const plannerRef = ref(database, getUserPath('weeklyPlanner'));
      const snapshot = await get(plannerRef);
      
      if (!snapshot.exists()) {
        return {};
      }
      
      return snapshot.val();
    },

    update: async (plan: WeeklyPlan): Promise<WeeklyPlan> => {
      const plannerRef = ref(database, getUserPath('weeklyPlanner'));
      await set(plannerRef, plan);
      return plan;
    },
  },
};

// Real-time subscription helpers
// Note: Exercises are hardcoded, so no subscription needed for them
export function subscribeToWorkoutLogs(callback: (logs: WorkoutLog[]) => void) {
  const logsRef = ref(database, getUserPath('workoutLogs'));
  
  const unsubscribe = onValue(logsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const data = snapshot.val();
    const logs = Object.keys(data).map(key => ({
      id: key,
      ...data[key],
    }));
    callback(logs);
  });
  
  return () => off(logsRef, 'value', unsubscribe);
}

export function subscribeToWeeklyPlanner(callback: (plan: WeeklyPlan) => void) {
  const plannerRef = ref(database, getUserPath('weeklyPlanner'));
  
  const unsubscribe = onValue(plannerRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback({});
      return;
    }
    
    callback(snapshot.val());
  });
  
  return () => off(plannerRef, 'value', unsubscribe);
}

