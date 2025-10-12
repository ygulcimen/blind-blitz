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

  // ONE-TIME interval setup - never restarts
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const state = gameStateRef.current;

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

      // Calculate elapsed time since current turn started
      const now = Date.now();
      const turnStartTime = new Date(state.last_move_time).getTime();
      const elapsed = now - turnStartTime;

      let whiteTime = state.white_time_ms;
      let blackTime = state.black_time_ms;

      // Deduct elapsed time from current player only
      if (state.current_turn === 'white') {
        whiteTime = Math.max(0, state.white_time_ms - elapsed);
      } else {
        blackTime = Math.max(0, state.black_time_ms - elapsed);
      }

      setDisplayTime({ white: whiteTime, black: blackTime });

      // Check timeout
      if (whiteTime === 0 && state.current_turn === 'white') {
        onTimeoutRef.current('white');
      } else if (blackTime === 0 && state.current_turn === 'black') {
        onTimeoutRef.current('black');
      }
    }, 100);

    // Cleanup on unmount only
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty deps - runs once on mount, never restarts

  // Sync display time when gameState changes (e.g., after a move)
  useEffect(() => {
    if (gameState && gameState.last_move_time) {
      // Immediately update display to reflect new server state
      const now = Date.now();
      const turnStartTime = new Date(gameState.last_move_time).getTime();
      const elapsed = now - turnStartTime;

      let whiteTime = gameState.white_time_ms;
      let blackTime = gameState.black_time_ms;

      if (gameState.current_turn === 'white') {
        whiteTime = Math.max(0, gameState.white_time_ms - elapsed);
      } else {
        blackTime = Math.max(0, gameState.black_time_ms - elapsed);
      }

      setDisplayTime({ white: whiteTime, black: blackTime });
    }
  }, [gameState?.white_time_ms, gameState?.black_time_ms, gameState?.last_move_time, gameState?.current_turn]);

  return displayTime;
};
