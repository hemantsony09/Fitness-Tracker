// Calorie calculation based on exercises, weight, height, and activity
import type { ExerciseEntry, Set as SetType } from './api';
import type { UserProfile } from './localStorageApi';

// MET (Metabolic Equivalent of Task) values for different exercises
// MET values represent the energy cost of activities
const EXERCISE_MET_VALUES: Record<string, number> = {
  // Strength Training
  'bench press': 5.0,
  'squat': 5.0,
  'deadlift': 6.0,
  'overhead press': 4.5,
  'barbell row': 5.0,
  'lat pulldown': 4.0,
  'leg press': 4.5,
  'leg extension': 3.5,
  'leg curl': 3.5,
  'bicep curl': 3.0,
  'tricep extension': 3.0,
  'shoulder press': 4.5,
  'chest press': 4.5,
  't-bar row': 5.0,
  'cable fly': 3.5,
  'lateral raise': 3.0,
  'rear delt fly': 3.0,
  'pull-up': 8.0,
  'dip': 6.0,
  'push-up': 8.0,
  'plank': 3.0,
  'crunch': 3.0,
  'sit-up': 8.0,
  
  // Cardio
  'running': 11.5,
  'jogging': 7.0,
  'walking': 3.5,
  'cycling': 8.0,
  'rowing': 7.0,
  'elliptical': 5.0,
  'stair climber': 9.0,
  'treadmill': 7.0,
  'jump rope': 12.0,
};

// Default MET value for unknown exercises
const DEFAULT_MET = 4.0; // Average for strength training

/**
 * Calculate calories burned for a single set
 * Formula: Calories = MET × weight (kg) × duration (hours)
 * For strength training, we estimate duration based on reps
 */
function calculateCaloriesForSet(
  exerciseName: string,
  set: SetType,
  weight: number, // user's body weight in kg
  exerciseWeight: number // weight used in exercise in kg
): number {
  // Find MET value for exercise
  const exerciseKey = exerciseName.toLowerCase();
  let met = DEFAULT_MET;
  
  for (const [key, value] of Object.entries(EXERCISE_MET_VALUES)) {
    if (exerciseKey.includes(key)) {
      met = value;
      break;
    }
  }

  // Estimate duration: ~3 seconds per rep for strength, ~1 second for cardio
  const isCardio = exerciseKey.includes('running') || 
                   exerciseKey.includes('cycling') || 
                   exerciseKey.includes('walking') ||
                   exerciseKey.includes('jogging') ||
                   exerciseKey.includes('elliptical') ||
                   exerciseKey.includes('treadmill');
  
  const secondsPerRep = isCardio ? 1 : 3;
  const durationMinutes = (set.reps * secondsPerRep) / 60;
  const durationHours = durationMinutes / 60;

  // Adjust MET based on exercise weight (heavier = more intensity)
  // For strength training, heavier weights increase intensity
  if (!isCardio && exerciseWeight > 0) {
    // Increase MET by up to 50% based on weight used
    // Assuming bodyweight exercises = baseline, heavy weights = +50%
    const weightMultiplier = Math.min(1 + (exerciseWeight / (weight * 2)), 1.5);
    met = met * weightMultiplier;
  }

  // Calculate calories: MET × weight (kg) × duration (hours)
  const calories = met * weight * durationHours;
  
  return Math.round(calories * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate total calories burned for an exercise
 * Only counts calories from completed sets
 */
export function calculateCaloriesForExercise(
  exercise: ExerciseEntry,
  userWeight: number
): number {
  if (!exercise.sets || exercise.sets.length === 0) {
    return 0;
  }

  // Check if there are any completed sets
  const completedSets = exercise.sets.filter(set => set.completed);
  if (completedSets.length === 0) {
    return 0; // No completed sets = no calories
  }

  let totalCalories = 0;
  for (const set of completedSets) {
    // Use the weight from the set, or 0 if it's bodyweight
    const exerciseWeight = set.weight || 0;
    const calories = calculateCaloriesForSet(
      exercise.exerciseName,
      set,
      userWeight,
      exerciseWeight
    );
    totalCalories += calories;
  }

  return Math.round(totalCalories * 10) / 10;
}

/**
 * Calculate total calories burned for a workout
 * Only counts calories from exercises with completed sets
 */
export function calculateTotalCalories(
  exercises: ExerciseEntry[],
  userWeight: number
): number {
  if (!exercises || exercises.length === 0) {
    return 0;
  }

  let total = 0;
  let hasCompletedSets = false;

  for (const exercise of exercises) {
    if (!exercise.sets || exercise.sets.length === 0) {
      continue; // Skip exercises with no sets
    }

    // Check if this exercise has any completed sets
    const hasCompleted = exercise.sets.some(set => set.completed);
    if (!hasCompleted) {
      continue; // Skip exercises with no completed sets
    }

    hasCompletedSets = true;
    const exerciseCalories = calculateCaloriesForExercise(exercise, userWeight);
    total += exerciseCalories;
  }

  // Only return calories if there are actually completed sets
  return hasCompletedSets ? Math.round(total * 10) / 10 : 0;
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 */
export function calculateBMR(profile: UserProfile): number {
  const { weight, height, age = 25, gender = 'male' } = profile;
  
  // Mifflin-St Jeor Equation
  // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
  // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
  
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }
  
  return Math.round(bmr);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × Activity Factor
 */
export function calculateTDEE(profile: UserProfile, activityLevel: number = 1.5): number {
  const bmr = calculateBMR(profile);
  return Math.round(bmr * activityLevel);
}

