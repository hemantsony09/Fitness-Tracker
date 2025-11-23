'use client';

import { useState } from 'react';
import { useWeeklyPlanner, useUpdateWeeklyPlanner } from '@/hooks/useWeeklyPlanner';
import { useExercises } from '@/hooks/useExercises';
import Card from '@/components/Card';
import Button from '@/components/Button';
import BottomSheet from '@/components/BottomSheet';
import { Plus, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Exercise } from '@/lib/api';

const days = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export default function PlannerPage() {
  const { data: weeklyPlan } = useWeeklyPlanner();
  const { data: exercises } = useExercises();
  const updatePlan = useUpdateWeeklyPlanner();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleAddExercises = (exerciseIds: string[]) => {
    if (!selectedDay || !exercises || exerciseIds.length === 0) return;

    // Get all selected exercises
    const selectedExercises = exercises.filter((e) => exerciseIds.includes(e.id));
    
    // Filter out exercises that already exist for this day
    const dayPlan = weeklyPlan?.[selectedDay] || { exercises: [] };
    const existingExerciseIds = new Set(dayPlan.exercises.map((e) => e.exerciseId));
    
    const newExercises = selectedExercises
      .filter((exercise) => !existingExerciseIds.has(exercise.id))
      .map((exercise, index) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + exercise.id,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        order: dayPlan.exercises.length + index + 1,
      }));

    if (newExercises.length === 0) {
      alert('All selected exercises are already in your plan for this day!');
      return;
    }

    updatePlan.mutate({
      ...weeklyPlan,
      [selectedDay]: {
        exercises: [...dayPlan.exercises, ...newExercises],
      },
    });

    setIsSheetOpen(false);
  };

  const handleDeleteExercise = (day: string, exerciseId: string) => {
    const dayPlan = weeklyPlan?.[day] || { exercises: [] };
    updatePlan.mutate({
      ...weeklyPlan,
      [day]: {
        exercises: dayPlan.exercises.filter((e) => e.id !== exerciseId),
      },
    });
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="sticky top-0 bg-black border-b border-gray-800 z-10 px-4 py-4">
        <h1 className="text-2xl font-bold text-white">Weekly Planner</h1>
        <p className="text-sm text-gray-400 mt-1">Plan your workouts for the week</p>
      </div>

      <div className="p-4 space-y-4">
        {days.map((day) => {
          const dayExercises = weeklyPlan?.[day.key]?.exercises || [];
          return (
            <motion.div
              key={day.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-white">{day.label}</h3>
                  <button
                    onClick={() => {
                      setSelectedDay(day.key);
                      setIsSheetOpen(true);
                    }}
                    className="p-2 text-white hover:text-gray-300 active:bg-gray-800 rounded-lg"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {dayExercises.length > 0 ? (
                  <div className="space-y-2">
                    {dayExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between p-3 bg-black rounded-xl"
                      >
                        <span className="font-medium text-white">{exercise.exerciseName}</span>
                        <button
                          onClick={() => handleDeleteExercise(day.key, exercise.id)}
                          className="p-1 text-gray-400 hover:text-white active:bg-gray-800 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No exercises planned</p>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedDay(null);
        }}
        title={`Add Exercise - ${days.find((d) => d.key === selectedDay)?.label || ''}`}
      >
        <ExerciseSelector
          exercises={exercises || []}
          onSelect={handleAddExercises}
        />
      </BottomSheet>
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

  // Category colors removed - using consistent black for all

  return (
    <div className="space-y-2">
      {/* Add Selected Button */}
      {selectedExercises.size > 0 && (
        <div className="sticky top-0 bg-black border-b border-gray-800 pb-3 mb-3 z-10">
          <Button
            fullWidth
            size="lg"
            onClick={handleAddSelected}
            className="bg-white text-black hover:bg-gray-200"
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

