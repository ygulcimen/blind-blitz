// components/LivePhase/TimerPanel.tsx - COMPLETELY ISOLATED TIMER
import React, { useEffect, useState, useRef } from 'react';

interface TimerPanelProps {
  label: string;
  active: boolean;
  timeMs: number;
  compact?: boolean;
}

const TimerPanel: React.FC<TimerPanelProps> = ({
  label,
  active,
  timeMs,
  compact = false,
}) => {
  const [currentTimeMs, setCurrentTimeMs] = useState(timeMs);
  const intervalRef = useRef<number | null>(null);
  const wasActiveRef = useRef<boolean>(false);
  const initialTimeSetRef = useRef<boolean>(false);
  const gameStartTimeRef = useRef<number>(timeMs);

  // 🔧 FIX: Only set initial time once, ignore all subsequent prop changes
  useEffect(() => {
    if (!initialTimeSetRef.current) {
      setCurrentTimeMs(timeMs);
      gameStartTimeRef.current = timeMs;
      initialTimeSetRef.current = true;
    }
  }, []); // Empty dependency array - only runs once

  // 🔧 FIX: Handle player switching - add increment and switch
  useEffect(() => {
    if (wasActiveRef.current && !active) {
      // Player just made a move, add 2 second increment
      setCurrentTimeMs((prev) => prev + 2000);
    }
    wasActiveRef.current = active;
  }, [active]); // Only depend on active, not timeMs

  // 🔧 FIX: Independent countdown
  useEffect(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!active) return;

    intervalRef.current = window.setInterval(() => {
      setCurrentTimeMs((prev) => {
        const newTime = Math.max(0, prev - 1000);

        if (newTime === 0 && prev > 0) {
          window.dispatchEvent(
            new CustomEvent('chess-timeout', {
              detail: { player: label.toLowerCase() },
            })
          );
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, label]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const isCritical = currentTimeMs <= 10000;
  const isWarning = currentTimeMs <= 30000 && currentTimeMs > 10000;
  const isWhite = label === 'WHITE';

  const formatCurrentTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`
        backdrop-blur-lg rounded-xl border shadow-lg p-2 transition-all duration-300 transform
        ${active ? 'scale-105 shadow-2xl' : 'scale-100'}
        ${
          isCritical && active
            ? 'animate-pulse border-red-400/70 bg-red-900/30 shadow-red-500/30'
            : isWarning && active
            ? 'border-yellow-400/50 bg-yellow-900/20 shadow-yellow-500/20'
            : active
            ? 'border-green-400/50 bg-green-900/20 shadow-green-500/20'
            : 'border-gray-300/20 bg-gray-800/40'
        }
        ${
          isWhite
            ? 'bg-gradient-to-br from-white/10 to-gray-100/5'
            : 'bg-gradient-to-br from-gray-900/50 to-black/30'
        }
        ${compact ? 'w-[100px] text-[11px]' : 'w-full'}
      `}
    >
      <div className="text-center">
        {/* Player Label */}
        <div
          className={`text-xs font-bold mb-1 flex items-center justify-center gap-1 ${
            isWhite ? 'text-white' : 'text-gray-100'
          }`}
        >
          <span className={compact ? 'text-base' : 'text-2xl'}>
            {isWhite ? '⚪' : '⚫'}
          </span>
          <span>{label}</span>
          {active && (
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>

        {/* Time Display */}
        <div
          className={`${
            compact ? 'text-2xl' : 'text-3xl lg:text-4xl'
          } font-black font-mono tracking-wider mb-1 ${
            isCritical && active
              ? 'text-red-400 animate-pulse'
              : isWarning && active
              ? 'text-yellow-400'
              : isWhite
              ? 'text-white'
              : 'text-gray-100'
          }`}
        >
          {formatCurrentTime(currentTimeMs)}
        </div>

        {/* Progress Bar */}
        <div
          className={`w-full rounded-full ${
            compact ? 'h-2 mb-1' : 'h-3 mb-2'
          } overflow-hidden ${isWhite ? 'bg-gray-700/50' : 'bg-gray-600/50'}`}
        >
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isCritical
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : isWarning
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}
            style={{
              width: `${Math.max(
                0,
                Math.min(100, (currentTimeMs / gameStartTimeRef.current) * 100)
              )}%`,
            }}
          />
        </div>

        {/* Status Text */}
        {active ? (
          <div className="text-xs font-medium flex items-center justify-center gap-1">
            {isCritical ? (
              <span className="text-red-400 font-bold animate-bounce">
                ⚠️ TIME TROUBLE!
              </span>
            ) : isWarning ? (
              <span className="text-yellow-400">⏰ Low Time</span>
            ) : (
              <span className="text-green-400">⚡ Active Turn</span>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400">Waiting...</div>
        )}
      </div>
    </div>
  );
};

export default TimerPanel;
