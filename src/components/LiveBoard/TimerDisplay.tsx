import React from 'react';

interface TimerDisplayProps {
  label: string;
  time: number;
  active?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  label,
  time,
  active = false,
}) => {
  const formatTime = (timeInMs: number): string => {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    const tenths = Math.floor((timeInMs % 1000) / 100);

    if (timeInMs < 60000) {
      // Less than 1 minute: show seconds.tenths
      return `${seconds}.${tenths}`;
    } else {
      // 1 minute or more: show MM:SS
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const getTimerStyles = () => {
    const baseStyles =
      'relative px-6 py-4 rounded-2xl font-bold transition-all duration-300 backdrop-blur-sm border-2 shadow-2xl transform hover:scale-105';

    if (active) {
      return `${baseStyles} bg-gradient-to-r from-amber-500/80 to-orange-500/80 border-amber-400/60 text-white shadow-amber-500/30 animate-pulse`;
    } else {
      return `${baseStyles} bg-gradient-to-r from-gray-700/80 to-gray-800/80 border-gray-600/60 text-gray-200`;
    }
  };

  const getProgressStyles = () => {
    const totalTime = 3 * 60 * 1000; // 3 minutes in ms
    const progress = (time / totalTime) * 100;

    if (time < 30000) {
      // Less than 30 seconds
      return `bg-gradient-to-r from-red-500 to-red-600 h-1 rounded-full transition-all duration-300 ${
        active ? 'animate-pulse' : ''
      }`;
    } else if (time < 60000) {
      // Less than 1 minute
      return `bg-gradient-to-r from-orange-500 to-orange-600 h-1 rounded-full transition-all duration-300`;
    } else {
      return `bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full transition-all duration-300`;
    }
  };

  return (
    <div className={getTimerStyles()}>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50 rounded-b-2xl overflow-hidden">
        <div
          className={getProgressStyles()}
          style={{ width: `${(time / (3 * 60 * 1000)) * 100}%` }}
        />
      </div>

      {/* Timer content */}
      <div className="relative z-10">
        <div className="text-center mb-2">
          <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="text-center">
          <span className="text-2xl font-black tabular-nums">
            {formatTime(time)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
