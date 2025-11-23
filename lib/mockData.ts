import { Exercise, WorkoutLog, WeeklyPlan } from './api';

export const mockExercises: Exercise[] = [
  // Chest
  { id: '1', name: 'Bench Press', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: '2', name: 'Incline Bench Press', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: '3', name: 'Decline Bench Press', category: 'strength', muscleGroups: ['chest', 'triceps'] },
  { id: '4', name: 'Dumbbell Press', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: '5', name: 'Incline Dumbbell Press', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: '6', name: 'Chest Fly', category: 'strength', muscleGroups: ['chest'] },
  { id: '7', name: 'Cable Fly', category: 'strength', muscleGroups: ['chest'] },
  { id: '8', name: 'Push-ups', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: '9', name: 'Dips', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'] },
  
  // Back
  { id: '10', name: 'Deadlift', category: 'strength', muscleGroups: ['back', 'hamstrings', 'glutes'] },
  { id: '11', name: 'Barbell Row', category: 'strength', muscleGroups: ['back', 'biceps'] },
  { id: '12', name: 'T-Bar Row', category: 'strength', muscleGroups: ['back', 'biceps'] },
  { id: '13', name: 'Pull-ups', category: 'strength', muscleGroups: ['back', 'biceps'] },
  { id: '14', name: 'Lat Pulldown', category: 'strength', muscleGroups: ['back', 'biceps'] },
  { id: '15', name: 'Wide Grip Pulldown', category: 'strength', muscleGroups: ['back', 'biceps'] },
  { id: '16', name: 'Close Grip Pulldown', category: 'strength', muscleGroups: ['back', 'biceps'] },
  { id: '17', name: 'Cable Row', category: 'strength', muscleGroups: ['back', 'biceps'] },
  { id: '18', name: 'Seated Cable Row', category: 'strength', muscleGroups: ['back', 'biceps'] },
  { id: '19', name: 'One-Arm Dumbbell Row', category: 'strength', muscleGroups: ['back', 'biceps'] },
  { id: '20', name: 'Bent Over Row', category: 'strength', muscleGroups: ['back', 'biceps'] },
  { id: '21', name: 'Shrugs', category: 'strength', muscleGroups: ['traps'] },
  { id: '22', name: 'Face Pulls', category: 'strength', muscleGroups: ['rear delts', 'traps'] },
  
  // Shoulders
  { id: '23', name: 'Overhead Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'] },
  { id: '24', name: 'Dumbbell Shoulder Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'] },
  { id: '25', name: 'Lateral Raises', category: 'strength', muscleGroups: ['shoulders'] },
  { id: '26', name: 'Front Raises', category: 'strength', muscleGroups: ['shoulders'] },
  { id: '27', name: 'Rear Delt Fly', category: 'strength', muscleGroups: ['rear delts'] },
  { id: '28', name: 'Arnold Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'] },
  { id: '29', name: 'Upright Row', category: 'strength', muscleGroups: ['shoulders', 'traps'] },
  { id: '30', name: 'Cable Lateral Raise', category: 'strength', muscleGroups: ['shoulders'] },
  
  // Legs
  { id: '31', name: 'Squat', category: 'strength', muscleGroups: ['quadriceps', 'glutes', 'hamstrings'] },
  { id: '32', name: 'Front Squat', category: 'strength', muscleGroups: ['quadriceps', 'glutes'] },
  { id: '33', name: 'Leg Press', category: 'strength', muscleGroups: ['quadriceps', 'glutes', 'hamstrings'] },
  { id: '34', name: 'Leg Extension', category: 'strength', muscleGroups: ['quadriceps'] },
  { id: '35', name: 'Leg Curl', category: 'strength', muscleGroups: ['hamstrings'] },
  { id: '36', name: 'Romanian Deadlift', category: 'strength', muscleGroups: ['hamstrings', 'glutes'] },
  { id: '37', name: 'Stiff Leg Deadlift', category: 'strength', muscleGroups: ['hamstrings', 'glutes'] },
  { id: '38', name: 'Lunges', category: 'strength', muscleGroups: ['quadriceps', 'glutes'] },
  { id: '39', name: 'Walking Lunges', category: 'strength', muscleGroups: ['quadriceps', 'glutes'] },
  { id: '40', name: 'Bulgarian Split Squat', category: 'strength', muscleGroups: ['quadriceps', 'glutes'] },
  { id: '41', name: 'Hack Squat', category: 'strength', muscleGroups: ['quadriceps', 'glutes'] },
  { id: '42', name: 'Calf Raises', category: 'strength', muscleGroups: ['calves'] },
  { id: '43', name: 'Seated Calf Raise', category: 'strength', muscleGroups: ['calves'] },
  { id: '44', name: 'Hip Thrust', category: 'strength', muscleGroups: ['glutes', 'hamstrings'] },
  { id: '45', name: 'Good Mornings', category: 'strength', muscleGroups: ['hamstrings', 'glutes'] },
  
  // Arms - Biceps
  { id: '46', name: 'Barbell Curl', category: 'strength', muscleGroups: ['biceps'] },
  { id: '47', name: 'Dumbbell Curl', category: 'strength', muscleGroups: ['biceps'] },
  { id: '48', name: 'Hammer Curl', category: 'strength', muscleGroups: ['biceps', 'forearms'] },
  { id: '49', name: 'Cable Curl', category: 'strength', muscleGroups: ['biceps'] },
  { id: '50', name: 'Preacher Curl', category: 'strength', muscleGroups: ['biceps'] },
  { id: '51', name: 'Concentration Curl', category: 'strength', muscleGroups: ['biceps'] },
  { id: '52', name: '21s', category: 'strength', muscleGroups: ['biceps'] },
  
  // Arms - Triceps
  { id: '53', name: 'Close Grip Bench Press', category: 'strength', muscleGroups: ['triceps', 'chest'] },
  { id: '54', name: 'Tricep Pushdown', category: 'strength', muscleGroups: ['triceps'] },
  { id: '55', name: 'Overhead Tricep Extension', category: 'strength', muscleGroups: ['triceps'] },
  { id: '56', name: 'Skull Crushers', category: 'strength', muscleGroups: ['triceps'] },
  { id: '57', name: 'Dumbbell Tricep Extension', category: 'strength', muscleGroups: ['triceps'] },
  { id: '58', name: 'Cable Tricep Extension', category: 'strength', muscleGroups: ['triceps'] },
  { id: '59', name: 'Diamond Push-ups', category: 'strength', muscleGroups: ['triceps', 'chest'] },
  
  // Core
  { id: '60', name: 'Plank', category: 'strength', muscleGroups: ['core'] },
  { id: '61', name: 'Crunches', category: 'strength', muscleGroups: ['core'] },
  { id: '62', name: 'Leg Raises', category: 'strength', muscleGroups: ['core'] },
  { id: '63', name: 'Russian Twists', category: 'strength', muscleGroups: ['core'] },
  { id: '64', name: 'Cable Crunch', category: 'strength', muscleGroups: ['core'] },
  { id: '65', name: 'Ab Wheel', category: 'strength', muscleGroups: ['core'] },
  { id: '66', name: 'Hanging Leg Raises', category: 'strength', muscleGroups: ['core'] },
  { id: '67', name: 'Dead Bug', category: 'strength', muscleGroups: ['core'] },
  
  // Cardio
  { id: '68', name: 'Running', category: 'cardio', muscleGroups: ['legs'] },
  { id: '69', name: 'Cycling', category: 'cardio', muscleGroups: ['legs'] },
  { id: '70', name: 'Rowing', category: 'cardio', muscleGroups: ['legs', 'back'] },
  { id: '71', name: 'Elliptical', category: 'cardio', muscleGroups: ['legs'] },
  { id: '72', name: 'Stair Climber', category: 'cardio', muscleGroups: ['legs'] },
  { id: '73', name: 'Treadmill', category: 'cardio', muscleGroups: ['legs'] },
  
  // Other
  { id: '74', name: 'Farmers Walk', category: 'strength', muscleGroups: ['forearms', 'traps', 'core'] },
  { id: '75', name: 'Kettlebell Swings', category: 'strength', muscleGroups: ['glutes', 'hamstrings', 'core'] },
];

export const mockWorkoutLogs: WorkoutLog[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    exercises: [
      {
        id: '1',
        exerciseId: '1',
        exerciseName: 'Bench Press',
        sets: [
          { id: '1', reps: 10, weight: 60, completed: true },
          { id: '2', reps: 8, weight: 70, completed: true },
          { id: '3', reps: 6, weight: 80, completed: false },
        ],
      },
    ],
    duration: 45,
    createdAt: new Date().toISOString(),
  },
];

export const mockWeeklyPlan: WeeklyPlan = {
  monday: {
    exercises: [
      { id: '1', exerciseId: '1', exerciseName: 'Bench Press', order: 1 },
      { id: '2', exerciseId: '11', exerciseName: 'Barbell Row', order: 2 },
      { id: '3', exerciseId: '23', exerciseName: 'Overhead Press', order: 3 },
    ],
  },
  tuesday: {
    exercises: [
      { id: '4', exerciseId: '31', exerciseName: 'Squat', order: 1 },
      { id: '5', exerciseId: '10', exerciseName: 'Deadlift', order: 2 },
      { id: '6', exerciseId: '33', exerciseName: 'Leg Press', order: 3 },
    ],
  },
  wednesday: {
    exercises: [
      { id: '7', exerciseId: '14', exerciseName: 'Lat Pulldown', order: 1 },
      { id: '8', exerciseId: '46', exerciseName: 'Barbell Curl', order: 2 },
      { id: '9', exerciseId: '54', exerciseName: 'Tricep Pushdown', order: 3 },
    ],
  },
};
