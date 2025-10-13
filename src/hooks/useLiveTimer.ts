// hooks/useLiveTimer.ts - Fixed: stable interval that doesn't restart
import { useEffect, useRef, useState } from 'react';
import type { LiveGameState } from '../services/liveMovesService';

interface TimerDisplay {
  white: number;
  black: number;
}

export const useLiveTimer = (
  gameState: LiveGameState | null,
  onTimeout: (player: 'white' | 'black') => void
): TimerDisplay => {
  // Initialize with server times if available
  const [displayTime, setDisplayTime] = useState<TimerDisplay>(() => ({
    white: gameState?.white_time_ms || 300000,
    black: gameState?.black_time_ms || 300000,
  }));

  const intervalRef = useRef<number | null>(null);

  // Store latest gameState in ref so interval can access it without restarting
  const gameStateRef = useRef<LiveGameState | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  // Update refs when props change (without restarting interval)
  useEffect(() => {
    gameStateRef.current = gameState;
    onTimeoutRef.current = onTimeout;
  }, [gameState, onTimeout]);

  // Sync display time with server when move happens (based on last_move_time change)
  useEffect(() => {
    if (!gameState || !gameState.last_move_time) return;

    // When a new move happens, sync timers with server values
    setDisplayTime({
      white: gameState.white_time_ms,
      black: gameState.black_time_ms,
    });
  }, [gameState?.last_move_time]);

  // ONE-TIME interval setup - never restarts
  useEffect(() => {
    let lastUpdateTime = Date.now();

    intervalRef.current = window.setInterval(() => {
      const state = gameStateRef.current;
      const now = Date.now();
      const delta = now - lastUpdateTime;
      lastUpdateTime = now;

      if (!state) {
        return; // Keep current display time instead of resetting
      }

      if (state.game_ended) {
        setDisplayTime({
          white: state.white_time_ms,
          black: state.black_time_ms,
        });
        return;
      }

      if (!state.last_move_time) {
        // If no last_move_time, just show server times without ticking
        setDisplayTime({
          white: state.white_time_ms,
          black: state.black_time_ms,
        });
        return;
      }

      // Smoothly decrease timer based on elapsed time since last tick
      setDisplayTime(prev => {
        let whiteTime = prev.white;
        let blackTime = prev.black;

        // Deduct delta from current player only for smooth countdown
        if (state.current_turn === 'white') {
          whiteTime = Math.max(0, prev.white - delta);
        } else {
          blackTime = Math.max(0, prev.black - delta);
        }

        // Check timeout
        if (whiteTime === 0 && state.current_turn === 'white') {
          onTimeoutRef.current('white');
        } else if (blackTime === 0 && state.current_turn === 'black') {
          onTimeoutRef.current('black');
        }

        return { white: whiteTime, black: blackTime };
      });
    }, 100);

    // Cleanup on unmount only
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty deps - runs once on mount, never restarts

  return displayTime;
};
