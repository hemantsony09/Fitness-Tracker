'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 text-lg rounded-xl border-2 bg-black text-white ${
          error ? 'border-gray-600' : 'border-gray-800'
        } focus:border-white focus:outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-gray-400">{error}</p>}
    </div>
  );
}

