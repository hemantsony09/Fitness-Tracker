'use client';

import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-colors active:scale-95';
  
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-600',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600',
    outline: 'border-2 border-white text-white hover:bg-black active:bg-gray-800',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}

