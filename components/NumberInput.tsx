'use client';

import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function NumberInput({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  label,
  unit,
  size = 'lg',
}: NumberInputProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(Math.min(value + step, max));
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(Math.max(value - step, min));
    }
  };

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          {label}
        </label>
      )}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus size={24} className="text-gray-700" />
        </motion.button>
        
        <div className="flex items-baseline gap-2 min-w-[120px] justify-center">
          <span className={`font-bold ${sizeClasses[size]}`}>
            {value}
          </span>
          {unit && <span className="text-lg text-gray-500">{unit}</span>}
        </div>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={24} className="text-gray-700" />
        </motion.button>
      </div>
    </div>
  );
}

