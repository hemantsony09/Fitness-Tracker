import { http, HttpResponse } from 'msw';
import { mockExercises, mockWorkoutLogs, mockWeeklyPlan } from './mockData';
import type { Exercise, WorkoutLog, WeeklyPlan } from './api';

// In-memory storage for development
let exercises = [...mockExercises];
let workoutLogs = [...mockWorkoutLogs];
let weeklyPlan = { ...mockWeeklyPlan };

export const handlers = [
  // Exercises
  http.get('/api/exercises', () => {
    return HttpResponse.json(exercises);
  }),

  http.get('/api/exercises/:id', ({ params }) => {
    const exercise = exercises.find((e) => e.id === params.id);
    if (!exercise) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(exercise);
  }),

  http.post('/api/exercises', async ({ request }) => {
    const body = await request.json() as Omit<Exercise, 'id'>;
    const newExercise: Exercise = {
      ...body,
      id: Date.now().toString(),
    };
    exercises.push(newExercise);
    return HttpResponse.json(newExercise, { status: 201 });
  }),

  http.put('/api/exercises/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Exercise>;
    const index = exercises.findIndex((e) => e.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    exercises[index] = { ...exercises[index], ...body };
    return HttpResponse.json(exercises[index]);
  }),

  http.delete('/api/exercises/:id', ({ params }) => {
    exercises = exercises.filter((e) => e.id !== params.id);
    return HttpResponse.json({ success: true });
  }),

  // Workout Logs
  http.get('/api/logs', () => {
    return HttpResponse.json(workoutLogs);
  }),

  http.get('/api/logs/:date', ({ params }) => {
    const log = workoutLogs.find((l) => l.date === params.date);
    if (!log) {
      return HttpResponse.json(null);
    }
    return HttpResponse.json(log);
  }),

  http.post('/api/logs', async ({ request }) => {
    const body = await request.json() as Omit<WorkoutLog, 'id' | 'createdAt'>;
    const newLog: WorkoutLog = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    workoutLogs.push(newLog);
    return HttpResponse.json(newLog, { status: 201 });
  }),

  http.put('/api/logs/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<WorkoutLog>;
    const index = workoutLogs.findIndex((l) => l.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    workoutLogs[index] = { ...workoutLogs[index], ...body };
    return HttpResponse.json(workoutLogs[index]);
  }),

  http.delete('/api/logs/:id', ({ params }) => {
    workoutLogs = workoutLogs.filter((l) => l.id !== params.id);
    return HttpResponse.json({ success: true });
  }),

  // Weekly Planner
  http.get('/api/planner', () => {
    return HttpResponse.json(weeklyPlan);
  }),

  http.put('/api/planner', async ({ request }) => {
    const body = await request.json() as WeeklyPlan;
    weeklyPlan = body;
    return HttpResponse.json(weeklyPlan);
  }),

  // Auth
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string };
    return HttpResponse.json({
      token: 'mock-token',
      user: { id: '1', email, name: 'User' },
    });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const { email, password, name } = await request.json() as { email: string; password: string; name: string };
    return HttpResponse.json({
      token: 'mock-token',
      user: { id: '1', email, name },
    });
  }),

  http.post('/api/auth/google', async ({ request }) => {
    const { email, name, picture } = await request.json() as { email: string; name: string; picture?: string };
    return HttpResponse.json({
      token: 'mock-google-token',
      user: { id: '1', email, name },
    });
  }),
];

