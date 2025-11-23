'use client';

import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`bg-black rounded-2xl shadow-sm border border-gray-800 p-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

