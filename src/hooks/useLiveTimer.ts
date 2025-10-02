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
  const [displayTime, setDisplayTime] = useState<TimerDisplay>({
    white: 300000,
    black: 300000,
  });

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
        setDisplayTime({ white: 300000, black: 300000 });
        return;
      }

      if (state.game_ended) {
        setDisplayTime({
          white: state.white_time_ms,
          black: state.black_time_ms,
        });
        return;
      }

      if (!state.last_move_time) {
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

  return displayTime;
};
