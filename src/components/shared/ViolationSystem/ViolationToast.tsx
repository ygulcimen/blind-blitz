import React from 'react';
import type { Violation } from './types';

interface ViolationToastProps {
  show: boolean;
  violations: Violation[];
  position?: 'top' | 'center' | 'bottom';
  className?: string;
}

export const ViolationToast: React.FC<ViolationToastProps> = ({
  show,
  violations,
  position = 'top',
  className = '',
}) => {
  if (violations.length === 0) return null;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'from-red-900/90 to-red-800/90 border-red-600/50';
      case 'warning':
        return 'from-yellow-900/90 to-yellow-800/90 border-yellow-600/50';
      case 'info':
        return 'from-blue-900/90 to-blue-800/90 border-blue-600/50';
      case 'success':
        return 'from-green-900/90 to-green-800/90 border-green-600/50';
      default:
        return 'from-red-900/90 to-red-800/90 border-red-600/50';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50';
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50';
      case 'bottom':
        return 'fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50';
      default:
        return 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50';
    }
  };

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      <div
        className={`
          transition-all duration-500 transform
          ${
            show
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-2'
          }
          bg-gradient-to-r ${getSeverityStyles(
            violations[0]?.severity || 'error'
          )}
          rounded-xl p-4 max-w-md mx-auto
          backdrop-blur-sm shadow-xl border
          ${show ? 'animate-pulse' : ''}
        `}
      >
        <div className="space-y-2">
          {violations.map((violation) => (
            <div key={violation.id} className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">{violation.icon}</span>
              <span className="text-white font-medium text-sm leading-relaxed flex-1">
                {violation.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
