// components/LivePhase/TimerPanel.tsx
import React from 'react';

interface TimerPanelProps {
  label: 'WHITE' | 'BLACK';
  time: string;
  active: boolean;
  timeMs: number;
}

const TimerPanel: React.FC<TimerPanelProps> = ({
  label,
  time,
  active,
  timeMs,
}) => {
  const isLowTime = timeMs <= 30000; // 30 seconds
  const isCritical = timeMs <= 10000; // 10 seconds

  return (
    <div
      className={`
        bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg
        rounded-xl shadow-2xl border border-white/10 p-4 lg:p-6
        transition-all duration-300 transform
        ${active ? 'scale-105 shadow-blue-500/30 border-blue-400/50' : ''}
        ${isCritical ? 'animate-pulse bg-red-900/50' : ''}
        min-w-[160px] lg:min-w-[200px]
      `}
    >
      {/* Player Label */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${
              label === 'WHITE'
                ? 'bg-white'
                : 'bg-gray-800 border-2 border-white'
            }`}
          />
          <span className="text-white font-bold text-sm lg:text-base">
            {label}
          </span>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center">
        <div
          className={`
            text-2xl lg:text-3xl xl:text-4xl font-mono font-bold transition-colors duration-300
            ${
              isCritical
                ? 'text-red-400'
                : isLowTime
                ? 'text-yellow-400'
                : 'text-white'
            }
          `}
        >
          {time}
        </div>

        {/* Time Warning */}
        {isLowTime && (
          <div className="mt-2">
            <div
              className={`text-xs font-bold ${
                isCritical ? 'text-red-400' : 'text-yellow-400'
              }`}
            >
              {isCritical ? '⚠️ CRITICAL!' : '⏰ Low Time'}
            </div>
          </div>
        )}

        {/* Active Indicator */}
        {active && (
          <div className="mt-3 flex justify-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerPanel;
