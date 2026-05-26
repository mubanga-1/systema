'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function PasswordInput({ label, error, className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations();

  const toggleVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-zinc-500 px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          className={`
            w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-100 
            placeholder:text-zinc-600 transition-all duration-300
            focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/5
            group-hover:border-zinc-700
            ${className}
          `}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-cyan-400 transition-colors focus:outline-none"
          aria-label={showPassword ? t('hidePassword') : t('showPassword')}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
              <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
              <line x1="2" x2="22" y1="2" y2="22"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
      {error && (
        <p className="text-[10px] font-mono text-red-500/80 px-1 italic">
          {error}
        </p>
      )}
    </div>
  );
}
