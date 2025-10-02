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
  const timeoutFiredRef = useRef<boolean>(false);
  const currentTurnRef = useRef<'white' | 'black' | null>(null);

  // Store server time and when we last synced - for absolute time calculation
  const serverTimeRef = useRef<{ white: number; black: number }>({ white: 0, black: 0 });
  const lastMoveTimeRef = useRef<number>(Date.now());
  const lastMoveCountRef = useRef<number>(0);

  // Memoize callback to prevent recreation
  const stableOnTimeout = useCallback(onTimeout, []);

  // Stop timer completely
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Sync with server state (when moves are made or game updates)
  useEffect(() => {
    if (!gameState) {
      setDisplayTime({ white: 0, black: 0 });
      stopTimer();
      return;
    }

    // Detect if this is a move update or initial load
    const isMoveUpdate = gameState.move_count !== lastMoveCountRef.current;
    lastMoveCountRef.current = gameState.move_count;

    let adjustedWhiteTime = gameState.white_time_ms;
    let adjustedBlackTime = gameState.black_time_ms;

    // If NOT a move update (just loading/refreshing), account for elapsed time
    if (!isMoveUpdate && gameState.last_move_time) {
      const serverLastMoveTime = new Date(gameState.last_move_time).getTime();
      const elapsedSinceLastMove = Math.max(0, Date.now() - serverLastMoveTime);

      // Only deduct from the current player's time
      if (gameState.current_turn === 'white') {
        adjustedWhiteTime = Math.max(0, gameState.white_time_ms - elapsedSinceLastMove);
      } else {
        adjustedBlackTime = Math.max(0, gameState.black_time_ms - elapsedSinceLastMove);
      }
    }
    // If it IS a move update, trust server times directly

    setDisplayTime({
      white: adjustedWhiteTime,
      black: adjustedBlackTime,
    });

    // Store server times and sync point for local countdown
    serverTimeRef.current = {
      white: adjustedWhiteTime,
      black: adjustedBlackTime,
    };

    // CRITICAL: Use server's last_move_time as reference, not Date.now()
    // This ensures all clients use the same reference point
    if (gameState.last_move_time) {
      lastMoveTimeRef.current = new Date(gameState.last_move_time).getTime();
    } else {
      lastMoveTimeRef.current = Date.now(); // Fallback if no last_move_time yet
    }

    // Update refs
    currentTurnRef.current = gameState.current_turn;
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
    gameState?.game_ended,
    gameState?.last_move_time,
    stopTimer,
  ]);

  // Main countdown timer - starts only when game exists and isn't ended
  useEffect(() => {
    // Don't start if no game state or game ended
    if (!gameState || gameState.game_ended) {
      stopTimer();
      return;
    }

    // Don't start timer until clock is started (last_move_time is set)
    if (!gameState.last_move_time) {
      stopTimer();
      return;
    }

    // Stop any existing timer first
    stopTimer();

    // Start the countdown
    timerRef.current = window.setInterval(() => {
      const now = Date.now();

      setDisplayTime((prev) => {
        const currentTurn = currentTurnRef.current;
        if (!currentTurn) return prev;

        // Calculate ABSOLUTE time remaining based on server time and last move
        const elapsedSinceLastMove = now - lastMoveTimeRef.current;

        // Countdown the CURRENT player's time, keep opponent's time static
        const newTimes = {
          white: currentTurn === 'white'
            ? Math.max(0, serverTimeRef.current.white - elapsedSinceLastMove)
            : serverTimeRef.current.white,
          black: currentTurn === 'black'
            ? Math.max(0, serverTimeRef.current.black - elapsedSinceLastMove)
            : serverTimeRef.current.black,
        };

        // Check for timeout
        if (currentTurn === 'white' && newTimes.white === 0 && prev.white > 0 && !timeoutFiredRef.current) {
          timeoutFiredRef.current = true;
          console.log('⏰ WHITE TIMEOUT!');
          setTimeout(() => stableOnTimeout('white'), 50);
        } else if (currentTurn === 'black' && newTimes.black === 0 && prev.black > 0 && !timeoutFiredRef.current) {
          timeoutFiredRef.current = true;
          console.log('⏰ BLACK TIMEOUT!');
          setTimeout(() => stableOnTimeout('black'), 50);
        }

        return newTimes;
      });
    }, 100);

    // Cleanup
    return stopTimer;
  }, [gameState?.game_id, gameState?.game_ended, gameState?.last_move_time, stopTimer, stableOnTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return stopTimer;
  }, [stopTimer]);

  return displayTime;
};
