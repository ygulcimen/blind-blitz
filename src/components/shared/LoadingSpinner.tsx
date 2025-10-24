// src/components/shared/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  subtext?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  text,
  subtext,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated Logo with Pulse and Glow */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 blur-md animate-pulse`}
        />
        {/* Logo */}
        <img
          src="/logo.png"
          alt="BlindBlitz"
          className={`relative ${sizeClasses[size]} rounded-lg animate-pulse`}
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </div>

      {/* Text */}
      {text && (
        <div className="text-center">
          <div className={`${textSizeClasses[size]} font-bold text-white mb-1`}>
            {text}
          </div>
          {subtext && (
            <div className="text-gray-400 text-sm">{subtext}</div>
          )}
        </div>
      )}
    </div>
  );
};

// Full-screen loading variant
interface LoadingScreenProps {
  text?: string;
  subtext?: string;
  gradient?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text = 'Loading...',
  subtext,
  gradient = 'from-black via-slate-900 to-black',
}) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${gradient} flex items-center justify-center`}
    >
      <LoadingSpinner size="xl" text={text} subtext={subtext} />
    </div>
  );
};
