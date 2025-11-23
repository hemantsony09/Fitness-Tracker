'use client';

import { useWorkoutLogByDate } from '@/hooks/useWorkoutLogs';
import { useWeeklyPlanner } from '@/hooks/useWeeklyPlanner';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { Plus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const { data: todayLog } = useWorkoutLogByDate(today);
  const { data: weeklyPlan } = useWeeklyPlanner();
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[new Date().getDay()];
  const todayPlan = weeklyPlan?.[todayName]?.exercises || [];

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="sticky top-0 bg-black border-b border-gray-800 z-10 px-4 py-4">
        <h1 className="text-2xl font-bold text-white">Today&apos;s Workout</h1>
        <p className="text-sm text-gray-400 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {todayLog ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {todayLog.exercises.map((exercise) => (
              <Card key={exercise.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-white">{exercise.exerciseName}</h3>
                    <div className="space-y-1">
                      {(exercise.sets || []).map((set, idx) => (
                        <div
                          key={set.id}
                          className={`flex items-center gap-3 text-sm ${
                            set.completed ? 'text-gray-400 line-through' : 'text-gray-100'
                          }`}
                        >
                          <span className="font-medium">Set {idx + 1}:</span>
                          <span>
                            {set.reps} reps × {set.weight} kg
                          </span>
                          {set.completed && (
                            <span className="ml-auto text-green-600">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Button
              fullWidth
              onClick={() => router.push('/logger')}
              className="mt-4"
            >
              Continue Workout
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {todayPlan.length > 0 ? (
              <>
                <Card>
                  <div className="text-center py-6">
                    <Calendar className="mx-auto mb-3 text-gray-500" size={48} />
                    <h3 className="font-bold text-lg mb-2 text-white">Planned Exercises</h3>
                    <ul className="space-y-2">
                      {todayPlan.map((ex) => (
                        <li key={ex.id} className="text-gray-300">
                          • {ex.exerciseName}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
                <Button
                  fullWidth
                  onClick={() => router.push('/logger')}
                  size="lg"
                >
                  <Plus className="inline mr-2" size={20} />
                  Start Workout
                </Button>
              </>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <Calendar className="mx-auto mb-3 text-gray-500" size={48} />
                  <h3 className="font-bold text-lg mb-2 text-white">No workout planned</h3>
                  <p className="text-gray-400 mb-4">
                    Start a new workout or plan your week
                  </p>
                  <div className="space-y-2">
                    <Button
                      fullWidth
                      onClick={() => router.push('/logger')}
                    >
                      <Plus className="inline mr-2" size={20} />
                      Start Free Workout
                    </Button>
                    <Button
                      fullWidth
                      variant="outline"
                      onClick={() => router.push('/planner')}
                    >
                      Plan Week
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
