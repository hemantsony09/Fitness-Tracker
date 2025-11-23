'use client';

import { useState } from 'react';
import { useExercises } from '@/hooks/useExercises';
import Card from '@/components/Card';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExercisesPage() {
  const { data: exercises, isLoading } = useExercises();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = exercises?.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="sticky top-0 bg-black border-b border-gray-800 z-10 px-4 py-4">
        <h1 className="text-2xl font-bold mb-3 text-white">Exercises</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-800 bg-black text-white focus:border-white focus:outline-none"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : filteredExercises && filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">{exercise.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-black border border-gray-800 text-gray-300 rounded-full capitalize">
                        {exercise.category}
                      </span>
                      {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                        <span className="text-xs text-gray-400">
                          {exercise.muscleGroups.join(', ')}
                        </span>
                      )}
                    </div>
                    {exercise.description && (
                      <p className="text-sm text-gray-300 mt-2">{exercise.description}</p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-400">
                {searchQuery ? 'No exercises found' : 'No exercises yet'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

