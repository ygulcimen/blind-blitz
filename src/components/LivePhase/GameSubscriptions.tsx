import { useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { liveMovesService, type LiveGameState, type LiveMove, type DrawOffer } from '../../services/liveMovesService';

interface GameSubscriptionsProps {
  gameId: string | undefined;
  myColor: 'white' | 'black' | null;
  currentUser: any;
  liveGameState: LiveGameState | null;
  loading: boolean;
  pendingOptimisticIdRef: React.MutableRefObject<string | null>;
  setLiveGameState: React.Dispatch<React.SetStateAction<LiveGameState | null>>;
  setLiveMoves: React.Dispatch<React.SetStateAction<LiveMove[]>>;
  setChessGame: React.Dispatch<React.SetStateAction<Chess | null>>;
  setDrawOffer: React.Dispatch<React.SetStateAction<DrawOffer | null>>;
  clearViolations: () => void;
}

export const GameSubscriptions: React.FC<GameSubscriptionsProps> = ({
  gameId,
  myColor,
  currentUser,
  liveGameState: _liveGameState,
  loading,
  pendingOptimisticIdRef,
  setLiveGameState,
  setLiveMoves,
  setChessGame,
  setDrawOffer,
  clearViolations,
}) => {
  // Heartbeat monitoring
  // Only start once when gameId is available, not on every liveGameState change
  const heartbeatStartedRef = useRef(false);

  useEffect(() => {
    if (!gameId || loading) return;

    // Only start heartbeat once per gameId
    if (!heartbeatStartedRef.current) {
      liveMovesService.startHeartbeatMonitoring(gameId);
      heartbeatStartedRef.current = true;
    }

    return () => {
      if (heartbeatStartedRef.current) {
        liveMovesService.stopHeartbeatMonitoring(gameId);
        heartbeatStartedRef.current = false;
      }
    };
  }, [gameId, loading]); // Removed liveGameState from dependencies

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

  // Store currentUser in ref to avoid stale closures
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Main real-time subscriptions
  useEffect(() => {
    if (!gameId || !myColor) return;

    console.log('🔌 Setting up real-time subscriptions for game:', gameId);

    const unsubscribe = liveMovesService.subscribeToGameUpdates(gameId, {
      onGameStateUpdate: (newGameState) => {
        console.log('🔄 GAME STATE UPDATE:', {
          game_ended: newGameState.game_ended,
          game_result: newGameState.game_result,
          move_count: newGameState.move_count,
          current_turn: newGameState.current_turn,
          last_move_time: newGameState.last_move_time,
          white_time_ms: newGameState.white_time_ms,
          black_time_ms: newGameState.black_time_ms,
        });

        setLiveGameState(prev => {
          if (!prev) return newGameState;

          const optimisticPending = !!pendingOptimisticIdRef.current;
          const serverIsNewer = (newGameState.move_count ?? 0) > (prev.move_count ?? 0);

          // CRITICAL FIX: Always accept FEN from opponent's moves
          // Only skip if we have optimistic update AND server move count hasn't changed
          const isOurOptimisticMove = optimisticPending && !serverIsNewer;
          const acceptFen = !isOurOptimisticMove;

          const updatedState = {
            ...prev,
            white_time_ms: newGameState.white_time_ms,
            black_time_ms: newGameState.black_time_ms,
            current_turn: newGameState.current_turn,
            last_move_time: newGameState.last_move_time,
            game_ended: newGameState.game_ended,
            game_result: newGameState.game_result ?? prev.game_result,
            move_count: acceptFen ? newGameState.move_count : prev.move_count,
            current_fen: acceptFen ? newGameState.current_fen : prev.current_fen,
          };

          // Update chess instance when FEN changes
          if (acceptFen && newGameState.current_fen !== prev.current_fen) {
            console.log('♟️ Updating chess instance with new FEN from server');
            setChessGame(new Chess(newGameState.current_fen));
          }

          console.log('🔄 UPDATED GAME STATE:', {
            game_ended: updatedState.game_ended,
            game_result: updatedState.game_result,
            acceptedFen: acceptFen,
            fenChanged: newGameState.current_fen !== prev.current_fen
          });

          return updatedState;
        });
      },

      onNewMove: (move) => {
        console.log('📝 NEW MOVE RECEIVED:', {
          moveId: move.id,
          moveNumber: move.move_number,
          san: move.move_san,
          playerId: move.player_id,
          currentUserId: currentUserRef.current?.id,
        });

        const isMine = move.player_id === currentUserRef.current?.id;
        const hasOptimistic = !!pendingOptimisticIdRef.current;

        console.log('🔍 Move ownership check:', { isMine, hasOptimistic });

        if (isMine && hasOptimistic) {
          console.log('✅ Replacing optimistic move with server move');
          setLiveMoves(prev => {
            const filtered = prev.filter(m => m.id !== pendingOptimisticIdRef.current);
            const newMoves = [...filtered, move].sort((a, b) => a.move_number - b.move_number);
            console.log('📊 Updated moves after replace:', newMoves.length);
            return newMoves;
          });
          pendingOptimisticIdRef.current = null;
        } else {
          console.log('📥 Adding opponent move to list');
          setLiveMoves(prev => {
            if (prev.some(m => m.id === move.id)) {
              console.log('⚠️ Move already exists, skipping');
              return prev;
            }
            const newMoves = [...prev, move].sort((a, b) => a.move_number - b.move_number);
            console.log('📊 Updated moves after add:', newMoves.length);
            return newMoves;
          });
        }

        // Only recreate chess if needed
        setChessGame(prevChess => {
          if (prevChess && prevChess.fen() === move.move_fen) return prevChess;
          return new Chess(move.move_fen);
        });

        clearViolations();
      },

      onDrawOfferUpdate: (offer) => {
        console.log('🤝 DRAW OFFER UPDATE:', offer);
        setDrawOffer(offer);
      },
    });

    return () => {
      console.log('🔌 Cleaning up subscriptions for game:', gameId);
      unsubscribe();
    };
  }, [gameId, myColor]); // Only re-subscribe when gameId or myColor changes

  return null; // This is a logic-only component
};