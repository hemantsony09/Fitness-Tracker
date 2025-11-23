'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutLogs, useDeleteWorkoutLog } from '@/hooks/useWorkoutLogs';
import { useUserProfile } from '@/hooks/useUserProfile';
import { calculateTotalCalories, calculateCaloriesForExercise } from '@/lib/calorieCalculator';
import Card from '@/components/Card';
import Button from '@/components/Button';
import BottomSheet from '@/components/BottomSheet';
import { Calendar, Clock, Trash2, Edit2, Search, X, TrendingUp, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorkoutLog } from '@/lib/api';

export default function HistoryPage() {
  const router = useRouter();
  const { data: workoutLogs, isLoading } = useWorkoutLogs();
  const { data: profile } = useUserProfile();
  const deleteLog = useDeleteWorkoutLog();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pb-24 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const sortedLogs = [...(workoutLogs || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter logs by search query (date or exercise name)
  const filteredLogs = sortedLogs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const dateStr = new Date(log.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).toLowerCase();
    
    const exerciseNames = (log.exercises || []).map(e => e.exerciseName.toLowerCase()).join(' ');
    
    return dateStr.includes(query) || exerciseNames.includes(query);
  });

  // Calculate statistics
  const totalWorkouts = sortedLogs.length;
  const totalExercises = sortedLogs.reduce((sum, log) => sum + (log.exercises?.length || 0), 0);
  const totalSets = sortedLogs.reduce((sum, log) => 
    sum + (log.exercises || []).reduce((exSum, ex) => exSum + (ex.sets?.length || 0), 0), 0
  );
  const completedSets = sortedLogs.reduce((sum, log) => 
    sum + (log.exercises || []).reduce((exSum, ex) => 
      exSum + (ex.sets || []).filter(s => s.completed).length, 0
    ), 0
  );

  const handleDelete = () => {
    if (selectedLog) {
      deleteLog.mutate(selectedLog.id, {
        onSuccess: () => {
          setIsDeleteSheetOpen(false);
          setSelectedLog(null);
        },
      });
    }
  };

  const handleEdit = (log: WorkoutLog) => {
    router.push(`/logger?date=${log.date}`);
  };

  const handleDeleteClick = (log: WorkoutLog) => {
    setSelectedLog(log);
    setIsDeleteSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="sticky top-0 bg-black border-b border-gray-800 z-10 px-4 py-4">
        <h1 className="text-2xl font-bold text-white">Workout History</h1>
        <p className="text-sm text-gray-400 mt-1">Manage all your past workouts</p>
        
        {/* Statistics */}
        {totalWorkouts > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-black rounded-lg p-2 border border-gray-800">
              <div className="text-xs text-gray-400 font-medium">Total Workouts</div>
              <div className="text-lg font-bold text-white">{totalWorkouts}</div>
            </div>
            <div className="bg-black rounded-lg p-2 border border-gray-800">
              <div className="text-xs text-gray-400 font-medium">Completed Sets</div>
              <div className="text-lg font-bold text-white">{completedSets}/{totalSets}</div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by date or exercise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-xl border-2 border-gray-800 bg-black text-white focus:border-white focus:outline-none text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredLogs.length === 0 ? (
          <Card>
            <div className="text-center py-8">
                  <Calendar className="mx-auto mb-3 text-gray-500" size={48} />
                  <h3 className="font-bold text-lg mb-2 text-white">
                    {searchQuery ? 'No workouts found' : 'No workouts yet'}
                  </h3>
                  <p className="text-gray-400">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Start logging your workouts to see them here'}
              </p>
            </div>
          </Card>
        ) : (
          <AnimatePresence>
            {filteredLogs.map((log) => {
              const completedSetsInLog = (log.exercises || []).reduce((sum, ex) => 
                sum + (ex.sets || []).filter(s => s.completed).length, 0
              );
              const totalSetsInLog = (log.exercises || []).reduce((sum, ex) => 
                sum + (ex.sets?.length || 0), 0
              );
              // Only calculate calories if there are completed sets
              const hasCompletedSets = (log.exercises || []).some(ex => 
                ex.sets?.some(set => set.completed)
              );
              const logCalories = profile && log.exercises && hasCompletedSets
                ? calculateTotalCalories(log.exercises, profile.weight)
                : 0;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 text-white">
                          {new Date(log.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          {log.duration && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{log.duration} min</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            <span>{completedSetsInLog}/{totalSetsInLog} sets</span>
                          </div>
                          <span>{(log.exercises || []).length} exercises</span>
                          {logCalories > 0 && (
                            <div className="flex items-center gap-1">
                              <Flame size={14} className="text-orange-500" />
                              <span className="text-orange-500 font-semibold">{logCalories} cal</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="p-2 text-gray-400 hover:text-white active:bg-gray-800 rounded-lg"
                          title="Edit workout"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(log)}
                          className="p-2 text-gray-400 hover:text-white active:bg-gray-800 rounded-lg"
                          title="Delete workout"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(log.exercises || []).map((exercise) => {
                        const exerciseSets = exercise.sets || [];
                        const exerciseCompletedSets = exerciseSets.filter(s => s.completed).length;
                        const exerciseTotalSets = exerciseSets.length;
                        const exerciseCalories = profile && exerciseCompletedSets > 0
                          ? calculateCaloriesForExercise(exercise, profile.weight)
                          : 0;
                        
                        return (
                          <div key={exercise.id} className="border-l-4 border-gray-700 pl-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-white">{exercise.exerciseName}</h4>
                                {exerciseCalories > 0 && (
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded">
                                    <Flame size={12} className="text-orange-500" />
                                    <span className="text-xs font-bold text-orange-500">{exerciseCalories}</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {exerciseCompletedSets}/{exerciseTotalSets} sets
                              </span>
                            </div>
                            <div className="space-y-1">
                              {(exercise.sets || []).map((set, idx) => (
                                <div
                                  key={set.id}
                                  className={`text-sm ${
                                    set.completed 
                                      ? 'text-gray-300 font-medium' 
                                      : 'text-gray-500'
                                  }`}
                                >
                                  Set {idx + 1}: {set.reps} reps × {set.weight} kg
                                  {set.completed && ' ✓'}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {log.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <p className="text-sm text-gray-300 italic">&quot;{log.notes}&quot;</p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirmation Sheet */}
      <BottomSheet
        isOpen={isDeleteSheetOpen}
        onClose={() => {
          setIsDeleteSheetOpen(false);
          setSelectedLog(null);
        }}
        title="Delete Workout"
      >
        {selectedLog && (
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to delete this workout?
            </p>
            <div className="bg-black rounded-lg p-3 border border-gray-800">
              <p className="font-semibold text-sm text-gray-400 mb-1">Date</p>
              <p className="text-white">
                {new Date(selectedLog.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="font-semibold text-sm text-gray-400 mt-3 mb-1">Exercises</p>
              <p className="text-white">{(selectedLog.exercises || []).length} exercises</p>
            </div>
            <div className="flex gap-2">
              <Button
                fullWidth
                variant="outline"
                onClick={() => {
                  setIsDeleteSheetOpen(false);
                  setSelectedLog(null);
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="primary"
                onClick={handleDelete}
                className="bg-white text-black hover:bg-gray-200"
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
