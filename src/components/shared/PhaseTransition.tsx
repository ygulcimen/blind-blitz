// components/shared/PhaseTransition.tsx - Smooth phase transition overlay
import React, { useEffect, useState } from 'react';

interface PhaseTransitionProps {
  fromPhase: string;
  toPhase: string;
  message?: string;
  duration?: number;
}

export const PhaseTransition: React.FC<PhaseTransitionProps> = ({
  fromPhase,
  toPhase,
  message,
  duration = 300,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const getPhaseIcon = (phase: string) => {
    switch (phase.toUpperCase()) {
      case 'WAITING':
        return '⏳';
      case 'BLIND':
        return '🕶️';
      case 'REVEAL':
      case 'ANIMATED_REVEAL':
        return '🎬';
      case 'LIVE':
        return '⚔️';
      default:
        return '🎮';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase.toUpperCase()) {
      case 'WAITING':
        return 'from-gray-400 to-gray-600';
      case 'BLIND':
        return 'from-blue-400 to-blue-600';
      case 'REVEAL':
      case 'ANIMATED_REVEAL':
        return 'from-purple-400 to-purple-600';
      case 'LIVE':
        return 'from-emerald-400 to-emerald-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      style={{
        animation: `fadeOut ${duration}ms ease-out forwards`,
      }}
    >
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">
          {getPhaseIcon(toPhase)}
        </div>
        <div
          className={`text-2xl font-bold bg-gradient-to-r ${getPhaseColor(
            toPhase
          )} bg-clip-text text-transparent mb-2`}
        >
          {message || `Transitioning to ${toPhase}...`}
        </div>
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-0" />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-400" />
        </div>
      </div>

      <style>{`
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            pointer-events: none;
          }
        }
        .delay-0 {
          animation-delay: 0ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
};
