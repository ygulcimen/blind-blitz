import { useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { liveMovesService, type LiveGameState, type LiveMove, type DrawOffer } from '../services/liveMovesService';
import type { GameResult } from '../types/GameTypes';

interface UseGameSubscriptionsParams {
  gameId: string | undefined;
  myColor: 'white' | 'black' | null;
  currentUser: any;
  liveGameState: LiveGameState | null;
  loading: boolean;
  setLiveGameState: React.Dispatch<React.SetStateAction<LiveGameState | null>>;
  setLiveMoves: React.Dispatch<React.SetStateAction<LiveMove[]>>;
  setChessGame: React.Dispatch<React.SetStateAction<Chess | null>>;
  setDrawOffer: React.Dispatch<React.SetStateAction<DrawOffer | null>>;
  onGameEnd: (result: GameResult) => void;
  clearViolations: () => void;
}

export const useGameSubscriptions = ({
  gameId,
  myColor,
  currentUser,
  liveGameState,
  loading,
  setLiveGameState,
  setLiveMoves,
  setChessGame,
  setDrawOffer,
  onGameEnd,
  clearViolations,
}: UseGameSubscriptionsParams) => {
  const pendingOptimisticIdRef = useRef<string | null>(null);

  // Heartbeat monitoring
  useEffect(() => {
    if (!gameId || !liveGameState || loading) return;

    liveMovesService.startHeartbeatMonitoring(gameId);

    return () => {
      liveMovesService.stopHeartbeatMonitoring(gameId);
    };
  }, [gameId, liveGameState, loading]);

  // Browser event handling
  useEffect(() => {
    if (!gameId) return;

    const handleBeforeUnload = () => {
      liveMovesService.leaveGame(gameId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      liveMovesService.leaveGame(gameId);
    };
  }, [gameId]);

  // Game abandonment handling
  useEffect(() => {
    if (
      liveGameState?.game_ended &&
      liveGameState?.game_result?.type === 'abandonment'
    ) {
      onGameEnd(liveGameState.game_result);
    }
  }, [liveGameState?.game_ended, liveGameState?.game_result, onGameEnd]);

  // Main real-time subscriptions
  useEffect(() => {
    if (!gameId || !myColor) return;

    console.log('📡 Setting up real-time subscriptions...');

    const unsubscribe = liveMovesService.subscribeToGameUpdates(gameId, {
      onGameStateUpdate: (newGameState) => {
        setLiveGameState(prev => {
          if (!prev) return newGameState;

          const optimisticPending = !!pendingOptimisticIdRef.current;
          const serverIsNewer = (newGameState.move_count ?? 0) > (prev.move_count ?? 0);
          const acceptFen = serverIsNewer && !optimisticPending;

          return {
            ...prev,
            // Always take timer/turn/end flags
            white_time_ms: newGameState.white_time_ms,
            black_time_ms: newGameState.black_time_ms,
            current_turn: newGameState.current_turn,
            game_ended: newGameState.game_ended,
            game_result: newGameState.game_result ?? prev.game_result,

            // Move counters
            move_count: acceptFen ? newGameState.move_count : prev.move_count,

            // FEN: ignore timer payloads that would roll us back
            current_fen: acceptFen ? newGameState.current_fen : prev.current_fen,
          };
        });
      },

      onNewMove: (move) => {
        const isMine = move.player_id === currentUser?.id;
        const hasOptimistic = !!pendingOptimisticIdRef.current;

        if (isMine && hasOptimistic) {
          setLiveMoves(prev => {
            const filtered = prev.filter(m => m.id !== pendingOptimisticIdRef.current);
            return [...filtered, move].sort((a, b) => a.move_number - b.move_number);
          });
          pendingOptimisticIdRef.current = null;
        } else {
          setLiveMoves(prev =>
            prev.some(m => m.id === move.id)
              ? prev
              : [...prev, move].sort((a, b) => a.move_number - b.move_number)
          );
        }

        // Only recreate chess if needed
        setChessGame(prevChess => {
          if (prevChess && prevChess.fen() === move.move_fen) return prevChess;
          return new Chess(move.move_fen);
        });

        clearViolations();
      },

      onDrawOfferUpdate: (offer) => {
        console.log('🔄 Draw offer updated:', offer);
        setDrawOffer(offer);
      },
    });

    return unsubscribe;
  }, [gameId, myColor, currentUser, setLiveGameState, setLiveMoves, setChessGame, setDrawOffer, clearViolations]);

  // Game end detection
  useEffect(() => {
    if (
      liveGameState?.game_ended &&
      liveGameState?.game_result &&
      typeof onGameEnd === 'function'
    ) {
      console.log('🏁 Game ended detected from server:', liveGameState.game_result);
      onGameEnd(liveGameState.game_result);
    }
  }, [liveGameState?.game_ended, liveGameState?.game_result, onGameEnd]);

  // Clear stuck pending state
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingOptimisticIdRef.current) {
        console.log('Clearing stuck pending state');
        pendingOptimisticIdRef.current = null;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Expose ref for move handler
  return { pendingOptimisticIdRef };
};