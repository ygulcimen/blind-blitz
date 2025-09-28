import { useState, useEffect, useRef, useCallback } from 'react';
import type { LiveGameState } from '../services/liveMovesService';

interface TimerState {
  white: number;
  black: number;
}

interface UseGameTimerReturn {
  displayTimes: TimerState;
  isRunning: boolean;
}

export const useGameTimer = (
  liveGameState: LiveGameState | null,
  onTimeout: (player: 'white' | 'black') => Promise<void>
): UseGameTimerReturn => {
  const [displayTimes, setDisplayTimes] = useState<TimerState>({ white: 0, black: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const hasTriggeredTimeoutRef = useRef<boolean>(false);

  const updateTimers = useCallback(() => {
    if (!liveGameState || liveGameState.game_ended) {
      setIsRunning(false);
      return;
    }

    const now = Date.now();
    const deltaMs = now - lastUpdateRef.current;
    lastUpdateRef.current = now;

    setDisplayTimes(prev => {
      const newTimes = { ...prev };

      // Only decrement time for the current turn
      if (liveGameState.current_turn === 'white') {
        newTimes.white = Math.max(0, prev.white - deltaMs);
      } else if (liveGameState.current_turn === 'black') {
        newTimes.black = Math.max(0, prev.black - deltaMs);
      }

      // Check for timeout
      if (!hasTriggeredTimeoutRef.current) {
        if (newTimes.white <= 0 && liveGameState.current_turn === 'white') {
          hasTriggeredTimeoutRef.current = true;
          onTimeout('white').catch(console.error);
        } else if (newTimes.black <= 0 && liveGameState.current_turn === 'black') {
          hasTriggeredTimeoutRef.current = true;
          onTimeout('black').catch(console.error);
        }
      }

      return newTimes;
    });
  }, [liveGameState, onTimeout]);

  // Sync with server times when game state updates
  useEffect(() => {
    if (!liveGameState) return;

    setDisplayTimes({
      white: liveGameState.white_time_ms,
      black: liveGameState.black_time_ms,
    });

    lastUpdateRef.current = Date.now();
    hasTriggeredTimeoutRef.current = liveGameState.game_ended;
    setIsRunning(!liveGameState.game_ended);
  }, [liveGameState?.white_time_ms, liveGameState?.black_time_ms, liveGameState?.game_ended]);

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(updateTimers, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, updateTimers]);

  return {
    displayTimes,
    isRunning,
  };
};