// src/hooks/useServerTimer.tsx - CLIENT-SIDE TIMER SYNC HOOK
import { useEffect, useRef } from 'react';
import { timerSyncService } from '../services/timerSyncService';
import type { LiveGameState } from '../services/liveMovesService';

export const useServerTimer = (
  gameId: string | undefined,
  liveGameState: LiveGameState | null,
  onGameStateUpdate: (newState: LiveGameState) => void,
  onGameEnd: (result: any) => void
) => {
  const syncIntervalRef = useRef<number | null>(null);
  const serverTimerCleanupRef = useRef<(() => void) | null>(null);

  // Start server-side timer
  useEffect(() => {
    if (!gameId || !liveGameState || liveGameState.game_ended) return;

    console.log('🚀 Starting server timer for game:', gameId);

    // Start server-side timer
    const cleanup = timerSyncService.startServerTimer(gameId);
    serverTimerCleanupRef.current = cleanup;

    return () => {
      if (serverTimerCleanupRef.current) {
        serverTimerCleanupRef.current();
        serverTimerCleanupRef.current = null;
      }
    };
  }, [gameId, liveGameState?.game_ended]);

  // Sync with server periodically and on visibility changes
  useEffect(() => {
    if (!gameId || !liveGameState) return;

    // Sync every 5 seconds to stay in sync
    syncIntervalRef.current = window.setInterval(async () => {
      if (!document.hidden) {
        const serverState = await timerSyncService.syncWithServer(gameId);
        if (serverState) {
          onGameStateUpdate(serverState);

          // Check for game end
          if (serverState.game_ended && serverState.game_result) {
            onGameEnd(serverState.game_result);
          }
        }
      }
    }, 5000);

    // Sync immediately when page becomes visible
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log('👀 Page visible - syncing immediately...');
        const serverState = await timerSyncService.syncWithServer(gameId);
        if (serverState) {
          onGameStateUpdate(serverState);

          if (serverState.game_ended && serverState.game_result) {
            onGameEnd(serverState.game_result);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameId, liveGameState, onGameStateUpdate, onGameEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (serverTimerCleanupRef.current) {
        serverTimerCleanupRef.current();
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);
};
