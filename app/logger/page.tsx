'use client';

import { useState, useEffect } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { useWorkoutLogByDate, useCreateWorkoutLog, useUpdateWorkoutLog } from '@/hooks/useWorkoutLogs';
import { useWeeklyPlanner } from '@/hooks/useWeeklyPlanner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { calculateTotalCalories, calculateCaloriesForExercise } from '@/lib/calorieCalculator';
import Card from '@/components/Card';
import Button from '@/components/Button';
import BottomSheet from '@/components/BottomSheet';
import { Plus, Check, Trash2, Minus, CheckCircle2, Calendar, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExerciseEntry, Set as SetType, Exercise } from '@/lib/api';

export default function LoggerPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('date') || new Date().toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const today = new Date().toISOString().split('T')[0];
  const isEditingPastWorkout = selectedDate !== today;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dateParam = params.get('date');
      if (dateParam) {
        setSelectedDate(dateParam);
      }
    }
  }, []);
  
  const { data: exercises, isLoading: exercisesLoading } = useExercises();
  const { data: todayLog, isLoading: logLoading } = useWorkoutLogByDate(selectedDate);
  const { data: weeklyPlan } = useWeeklyPlanner();
  const { data: profile } = useUserProfile();
  const createLog = useCreateWorkoutLog();
  const updateLog = useUpdateWorkoutLog();

  const [isExerciseSheetOpen, setIsExerciseSheetOpen] = useState(false);

  const workoutExercises = todayLog?.exercises || [];

  // Get today's planned exercises
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[new Date().getDay()];
  const todayPlan = weeklyPlan?.[todayName]?.exercises || [];

  // Add all planned exercises at once
  const handleAddAllWorkout = () => {
    if (!exercises || todayPlan.length === 0) return;

    const existingExerciseIds = new Set(workoutExercises.map((e) => e.exerciseId));
    const newExercises: ExerciseEntry[] = todayPlan
      .filter((planEx) => !existingExerciseIds.has(planEx.exerciseId))
      .map((planEx) => {
        const exercise = exercises.find((e) => e.id === planEx.exerciseId);
        return {
          id: Date.now().toString() + Math.random(),
          exerciseId: planEx.exerciseId,
          exerciseName: planEx.exerciseName,
          sets: [],
        };
      });

    if (newExercises.length === 0) return;

    const updatedExercises = [...workoutExercises, ...newExercises];

    if (todayLog) {
      updateLog.mutate({
        id: todayLog.id,
        log: { exercises: updatedExercises },
      });
    } else {
      createLog.mutate({
        date: selectedDate,
        exercises: updatedExercises,
      });
    }
  };

  const handleAddExercises = async (exerciseIds: string[]) => {
    if (!exercises || exercises.length === 0) {
      console.error('Exercises not loaded yet');
      return;
    }
    
    if (exerciseIds.length === 0) {
      return;
    }

    // Get all selected exercises
    const selectedExercises = exercises.filter((e) => exerciseIds.includes(e.id));
    
    // Filter out exercises that already exist
    const existingExerciseIds = new Set(workoutExercises.map((e) => e.exerciseId));
    const newExercises: ExerciseEntry[] = selectedExercises
      .filter((exercise) => !existingExerciseIds.has(exercise.id))
      .map((exercise) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + exercise.id,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: [],
      }));

    if (newExercises.length === 0) {
      alert('All selected exercises are already in your workout!');
      return;
    }

    const updatedExercises = [...workoutExercises, ...newExercises];

    try {
      if (todayLog && todayLog.id) {
        // Update existing log
        await updateLog.mutateAsync({
          id: todayLog.id,
          log: { exercises: updatedExercises },
        });
      } else {
        // Create new log only if none exists
        await createLog.mutateAsync({
          date: selectedDate,
          exercises: updatedExercises,
        });
      }
      // Close sheet after successful mutation
      setIsExerciseSheetOpen(false);
    } catch (error) {
      console.error('Error adding exercises:', error);
      alert('Failed to add exercises. Please check console for details.');
    }
  };

  // Quick add set with smart defaults
  const handleQuickAddSet = (exerciseId: string) => {
      const exercise = workoutExercises.find((e) => e.id === exerciseId);
      if (!exercise) return;

      const exerciseSets = exercise.sets || [];
      const lastSet = exerciseSets[exerciseSets.length - 1];
    const defaultReps = lastSet?.reps || 10;
    const defaultWeight = lastSet ? lastSet.weight + 2.5 : 60; // Increment weight by 2.5kg

    const newSet: SetType = {
      id: Date.now().toString(),
      reps: defaultReps,
      weight: defaultWeight,
      completed: false,
    };

    const updatedExercises = workoutExercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: [...(ex.sets || []), newSet],
        };
      }
      return ex;
    });

    if (todayLog) {
      updateLog.mutate({
        id: todayLog.id,
        log: { exercises: updatedExercises },
      });
    } else {
      createLog.mutate({
        date: selectedDate,
        exercises: updatedExercises,
      });
    }
  };

  const handleUpdateSet = (exerciseId: string, setId: string, updates: Partial<SetType>) => {
        const updatedExercises = workoutExercises.map((ex) => {
          if (ex.id === exerciseId) {
            return {
              ...ex,
              sets: (ex.sets || []).map((s) =>
                s.id === setId ? { ...s, ...updates } : s
              ),
            };
          }
          return ex;
        });

    if (todayLog) {
      updateLog.mutate({
        id: todayLog.id,
        log: { exercises: updatedExercises },
      });
    } else {
      createLog.mutate({
        date: selectedDate,
        exercises: updatedExercises,
      });
    }
  };

  const handleToggleSetComplete = (exerciseId: string, setId: string) => {
      const exercise = workoutExercises.find((e) => e.id === exerciseId);
      const set = exercise?.sets?.find((s) => s.id === setId);
      if (!set) return;

    // When completing, record the actual reps and weight done
    handleUpdateSet(exerciseId, setId, { 
      completed: !set.completed,
      // The reps and weight are already set, just mark as completed
    });
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
        const updatedExercises = workoutExercises.map((ex) => {
          if (ex.id === exerciseId) {
            return {
              ...ex,
              sets: (ex.sets || []).filter((s) => s.id !== setId),
            };
          }
          return ex;
        });

    if (todayLog) {
      updateLog.mutate({
        id: todayLog.id,
        log: { exercises: updatedExercises },
      });
    } else {
      createLog.mutate({
        date: selectedDate,
        exercises: updatedExercises,
      });
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    const updatedExercises = workoutExercises.filter((e) => e.id !== exerciseId);

    if (todayLog) {
      if (updatedExercises.length === 0) {
        updateLog.mutate({
          id: todayLog.id,
          log: { exercises: [] },
        });
      } else {
        updateLog.mutate({
          id: todayLog.id,
          log: { exercises: updatedExercises },
        });
      }
    } else {
      createLog.mutate({
        date: today,
        exercises: updatedExercises,
      });
    }
  };

  // Calculate completed sets summary
  const completedSetsCount = workoutExercises.reduce((total, ex) => {
    return total + (ex.sets || []).filter((s) => s.completed).length;
  }, 0);

  const totalSetsCount = workoutExercises.reduce((total, ex) => {
    return total + (ex.sets || []).length;
  }, 0);

  // Only calculate calories if there are exercises with completed sets
  const hasCompletedSets = workoutExercises.some(ex => 
    ex.sets?.some(set => set.completed)
  );
  
  const totalCalories = profile && workoutExercises.length > 0 && hasCompletedSets
    ? calculateTotalCalories(workoutExercises, profile.weight)
    : 0;

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="sticky top-0 bg-black border-b border-gray-800 z-10 px-4 py-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-white">Exercise Logger</h1>
          {isEditingPastWorkout && (
            <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-full font-medium">
              Editing Past Workout
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          {isEditingPastWorkout 
            ? `Editing: ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
            : 'Tap to adjust • Single click actions'}
        </p>
        <div className="mt-2 flex items-center gap-4 text-sm">
          {totalSetsCount > 0 && (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-white" />
              <span className="text-gray-300">
                <span className="font-semibold text-white">{completedSetsCount}</span> of{' '}
                <span className="font-semibold text-white">{totalSetsCount}</span> sets
              </span>
            </div>
          )}
          {totalCalories > 0 && (
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-500" />
              <span className="text-gray-300">
                <span className="font-semibold text-orange-500">{totalCalories}</span> cal
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Add All Workout Button */}
        {todayPlan.length > 0 && workoutExercises.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              fullWidth
              onClick={handleAddAllWorkout}
              size="lg"
              className="bg-white text-black hover:bg-gray-200"
            >
              <Calendar className="inline mr-2" size={20} />
              Add All Planned Workout ({todayPlan.length} exercises)
            </Button>
          </motion.div>
        )}

        <AnimatePresence>
          {workoutExercises.map((exercise) => {
            const completedSets = (exercise.sets || []).filter((s) => s.completed).length;
            const totalSets = (exercise.sets || []).length;
            // Only calculate calories if there are completed sets
            const exerciseCalories = profile && completedSets > 0
              ? calculateCaloriesForExercise(exercise, profile.weight)
              : 0;
            
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-xl text-white">{exercise.exerciseName}</h3>
                        {exerciseCalories > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                            <Flame size={16} className="text-orange-500" />
                            <span className="text-base font-bold text-orange-500">{exerciseCalories}</span>
                            <span className="text-xs text-orange-400">cal</span>
                          </div>
                        )}
                      </div>
                      {totalSets > 0 && (
                        <p className="text-sm text-gray-400">
                          {completedSets}/{totalSets} sets completed
                          {exerciseCalories > 0 && (
                            <span className="ml-2 text-orange-400">
                              • {exerciseCalories} calories burned
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="p-2 text-gray-400 hover:text-white active:bg-gray-800 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="space-y-3 mb-4">
                    {(exercise.sets || []).map((set, idx) => (
                      <SetRow
                        key={set.id}
                        set={set}
                        index={idx}
                        onToggleComplete={() => handleToggleSetComplete(exercise.id, set.id)}
                        onUpdateReps={(reps) => handleUpdateSet(exercise.id, set.id, { reps })}
                        onUpdateWeight={(weight) => handleUpdateSet(exercise.id, set.id, { weight })}
                        onDelete={() => handleDeleteSet(exercise.id, set.id)}
                      />
                    ))}
                  </div>

                  <Button
                    fullWidth
                    onClick={() => handleQuickAddSet(exercise.id)}
                    size="lg"
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <Plus className="inline mr-2" size={20} />
                    Quick Add Set
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <Button
          fullWidth
          onClick={() => setIsExerciseSheetOpen(true)}
          size="lg"
        >
          <Plus className="inline mr-2" size={20} />
          Add Exercise
        </Button>
      </div>

      {/* Exercise Selection Sheet */}
      <BottomSheet
        isOpen={isExerciseSheetOpen}
        onClose={() => setIsExerciseSheetOpen(false)}
        title="Select Exercise"
      >
        <ExerciseSelector
          exercises={exercises || []}
          onSelect={handleAddExercises}
        />
      </BottomSheet>
    </div>
  );
}

interface SetRowProps {
      set: SetType;
  index: number;
  onToggleComplete: () => void;
  onUpdateReps: (reps: number) => void;
  onUpdateWeight: (weight: number) => void;
  onDelete: () => void;
}

function SetRow({ set, index, onToggleComplete, onUpdateReps, onUpdateWeight, onDelete }: SetRowProps) {
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
        set.completed
          ? 'bg-gray-800 border-gray-700 shadow-sm'
          : 'bg-black border-gray-800'
      }`}
    >
      {/* Complete Checkbox */}
      <button
        onClick={onToggleComplete}
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          set.completed
            ? 'bg-white border-white shadow-md'
            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
        }`}
      >
        {set.completed && <Check size={22} className="text-white" />}
      </button>

      {/* Set Number */}
      <div className="w-12 text-center">
        <span className={`text-sm font-semibold ${set.completed ? 'text-white' : 'text-gray-400'}`}>
          #{index + 1}
        </span>
      </div>

      {/* Reps Control */}
      <div className="flex items-center gap-1 flex-1">
        <span className="text-xs text-gray-400 w-10">Reps</span>
        <button
          onClick={() => onUpdateReps(Math.max(1, set.reps - 1))}
          className="w-10 h-10 rounded-lg bg-gray-800 active:bg-gray-700 flex items-center justify-center disabled:opacity-50"
          disabled={set.completed}
        >
          <Minus size={16} className="text-gray-200" />
        </button>
        <span className={`text-lg font-bold w-12 text-center ${set.completed ? 'text-white' : 'text-gray-100'}`}>
          {set.reps}
        </span>
        <button
          onClick={() => onUpdateReps(set.reps + 1)}
          className="w-10 h-10 rounded-lg bg-gray-800 active:bg-gray-700 flex items-center justify-center disabled:opacity-50"
          disabled={set.completed}
        >
          <Plus size={16} className="text-gray-200" />
        </button>
      </div>

      {/* Weight Control */}
      <div className="flex items-center gap-1 flex-1">
        <span className="text-xs text-gray-400 w-12">Kg</span>
        <button
          onClick={() => onUpdateWeight(Math.max(0, set.weight - 2.5))}
          className="w-10 h-10 rounded-lg bg-gray-800 active:bg-gray-700 flex items-center justify-center disabled:opacity-50"
          disabled={set.completed}
        >
          <Minus size={16} className="text-gray-200" />
        </button>
        <span className={`text-lg font-bold w-14 text-center ${set.completed ? 'text-white' : 'text-gray-100'}`}>
          {set.weight}
        </span>
        <button
          onClick={() => onUpdateWeight(set.weight + 2.5)}
          className="w-10 h-10 rounded-lg bg-gray-800 active:bg-gray-700 flex items-center justify-center disabled:opacity-50"
          disabled={set.completed}
        >
          <Plus size={16} className="text-gray-200" />
        </button>
      </div>

      {/* Completed Badge */}
      {set.completed && (
        <div className="flex-shrink-0 px-2 py-1 bg-white text-black text-xs font-semibold rounded-lg">
          Done
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="w-10 h-10 rounded-lg text-gray-400 hover:text-white active:bg-gray-800 flex items-center justify-center flex-shrink-0"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

interface ExerciseSelectorProps {
  exercises: Exercise[];
  onSelect: (exerciseIds: string[]) => void;
}

function ExerciseSelector({ exercises, onSelect }: ExerciseSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());

  // Categorize exercises by Push/Pull/Legs/Cardio/Abs
  const categorizeExercise = (exercise: Exercise): string => {
    // Cardio exercises
    if (exercise.category === 'cardio') {
      return 'Cardio';
    }

    const muscleGroups = exercise.muscleGroups || [];
    const muscles = muscleGroups.map(m => m.toLowerCase());

    // Push: Chest, Shoulders, Triceps
    if (
      muscles.some(m => m.includes('chest')) ||
      muscles.some(m => m.includes('shoulder')) ||
      muscles.some(m => m.includes('tricep')) ||
      muscles.some(m => m.includes('delts'))
    ) {
      return 'Push';
    }

    // Pull: Back, Biceps
    if (
      muscles.some(m => m.includes('back')) ||
      muscles.some(m => m.includes('bicep')) ||
      muscles.some(m => m.includes('trap'))
    ) {
      return 'Pull';
    }

    // Legs: Quadriceps, Hamstrings, Glutes, Calves
    if (
      muscles.some(m => m.includes('quad')) ||
      muscles.some(m => m.includes('hamstring')) ||
      muscles.some(m => m.includes('glute')) ||
      muscles.some(m => m.includes('calf')) ||
      muscles.some(m => m.includes('leg'))
    ) {
      return 'Legs';
    }

    // Abs: Core
    if (
      muscles.some(m => m.includes('core')) ||
      muscles.some(m => m.includes('abs'))
    ) {
      return 'Abs';
    }

    return 'Other';
  };

  // Group exercises by category
  const groupedExercises = exercises.reduce((acc, exercise) => {
    const category = categorizeExercise(exercise);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleExercise = (exerciseId: string) => {
    const newSelected = new Set(selectedExercises);
    if (newSelected.has(exerciseId)) {
      newSelected.delete(exerciseId);
    } else {
      newSelected.add(exerciseId);
    }
    setSelectedExercises(newSelected);
  };

  const handleAddSelected = () => {
    if (selectedExercises.size === 0) {
      alert('Please select at least one exercise');
      return;
    }
    onSelect(Array.from(selectedExercises));
    setSelectedExercises(new Set()); // Clear selection after adding
  };

  // Category order
  const categoryOrder = ['Push', 'Pull', 'Legs', 'Cardio', 'Abs', 'Other'];

  return (
    <div className="space-y-2">
      {/* Add Selected Button */}
      {selectedExercises.size > 0 && (
        <div className="sticky top-0 bg-black border-b border-gray-800 pb-3 mb-3 z-10">
          <Button
            fullWidth
            size="lg"
            onClick={handleAddSelected}
          >
            Add {selectedExercises.size} {selectedExercises.size === 1 ? 'Exercise' : 'Exercises'}
          </Button>
        </div>
      )}

      {categoryOrder.map((category) => {
        const categoryExercises = groupedExercises[category] || [];
        if (categoryExercises.length === 0) return null;

        const isExpanded = expandedCategories.has(category);

        return (
          <div key={category} className="border-2 border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 bg-black border-gray-800 transition-colors"
            >
              <h3 className="font-bold text-lg text-white">{category}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{categoryExercises.length}</span>
                {isExpanded ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>
            </button>
            
            {isExpanded && (
              <div className="p-2 space-y-1 bg-black">
                {categoryExercises.map((exercise) => {
                  const isSelected = selectedExercises.has(exercise.id);
                  return (
                    <button
                      key={exercise.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleExercise(exercise.id);
                      }}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors touch-manipulation flex items-center gap-3 ${
                        isSelected
                          ? 'border-white bg-black'
                          : 'border-gray-800 hover:border-gray-700 hover:bg-black'
                      }`}
                      type="button"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-white bg-white'
                          : 'border-gray-700'
                      }`}>
                        {isSelected && (
                          <Check size={14} className="text-black" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{exercise.name}</h4>
                        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {exercise.muscleGroups.join(', ')}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
