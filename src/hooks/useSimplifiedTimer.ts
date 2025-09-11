import { useEffect, useRef, useState, useCallback } from 'react';
import type { LiveGameState } from '../services/liveMovesService';

export const useSimplifiedTimer = (
  gameState: LiveGameState | null,
  onTimeout: (player: 'white' | 'black') => void
) => {
  const [displayTime, setDisplayTime] = useState({
    white: 0,
    black: 0,
  });

  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const timeoutFiredRef = useRef<boolean>(false);
  const currentTurnRef = useRef<'white' | 'black' | null>(null);

  // Memoize callback to prevent recreation
  const stableOnTimeout = useCallback(onTimeout, []);

  // Stop timer completely
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      console.log('⏹️ Timer stopped');
    }
  }, []);

  // Sync with server state (when moves are made or game updates)
  useEffect(() => {
    if (!gameState) {
      setDisplayTime({ white: 0, black: 0 });
      stopTimer();
      return;
    }

    console.log('🔄 Syncing timer with server:', {
      serverWhite: Math.floor(gameState.white_time_ms / 1000),
      serverBlack: Math.floor(gameState.black_time_ms / 1000),
      turn: gameState.current_turn,
      ended: gameState.game_ended,
      moveCount: gameState.move_count,
    });

    // Update display times with server values
    setDisplayTime({
      white: gameState.white_time_ms,
      black: gameState.black_time_ms,
    });

    // Update refs
    currentTurnRef.current = gameState.current_turn;
    lastTickRef.current = Date.now();
    timeoutFiredRef.current = false;

    // If game ended, stop timer
    if (gameState.game_ended) {
      stopTimer();
      return;
    }
  }, [
    gameState?.white_time_ms,
    gameState?.black_time_ms,
    gameState?.current_turn,
    gameState?.move_count,
    gameState?.game_ended,
    stopTimer,
  ]);

  // Main countdown timer - starts only when game exists and isn't ended
  useEffect(() => {
    // Don't start if no game state or game ended
    if (!gameState || gameState.game_ended) {
      stopTimer();
      return;
    }

    // Stop any existing timer first
    stopTimer();

    console.log('▶️ Starting countdown timer for:', gameState.current_turn);
    lastTickRef.current = Date.now();

    // Start the countdown
    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      setDisplayTime((prev) => {
        const currentTurn = currentTurnRef.current;
        if (!currentTurn) return prev;

        const newTimes = { ...prev };

        // Only countdown the current player's time
        if (currentTurn === 'white') {
          newTimes.white = Math.max(0, prev.white - elapsed);

          // Check for timeout
          if (
            newTimes.white === 0 &&
            prev.white > 0 &&
            !timeoutFiredRef.current
          ) {
            timeoutFiredRef.current = true;
            console.log('⏰ WHITE TIMEOUT!');
            setTimeout(() => stableOnTimeout('white'), 50);
          }
        } else {
          newTimes.black = Math.max(0, prev.black - elapsed);

          // Check for timeout
          if (
            newTimes.black === 0 &&
            prev.black > 0 &&
            !timeoutFiredRef.current
          ) {
            timeoutFiredRef.current = true;
            console.log('⏰ BLACK TIMEOUT!');
            setTimeout(() => stableOnTimeout('black'), 50);
          }
        }

        return newTimes;
      });
    }, 100);

    // Cleanup
    return stopTimer;
  }, [gameState?.game_id, gameState?.game_ended, stopTimer, stableOnTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return stopTimer;
  }, [stopTimer]);

  return displayTime;
};
