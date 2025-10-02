import { useState, useRef, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { liveMovesService, type LiveGameState, type LiveMove } from '../services/liveMovesService';
import { useViolations } from '../components/shared/ViolationSystem';

interface UseMoveHandlerParams {
  gameId: string | undefined;
  currentUser: any;
  liveGameState: LiveGameState | null;
  chessGame: Chess | null;
  myColor: 'white' | 'black' | null;
  liveMoves: LiveMove[];
  setLiveGameState: React.Dispatch<React.SetStateAction<LiveGameState | null>>;
  setChessGame: React.Dispatch<React.SetStateAction<Chess | null>>;
  setLiveMoves: React.Dispatch<React.SetStateAction<LiveMove[]>>;
}

interface UseMoveHandlerReturn {
  handleDrop: (from: string, to: string, piece: string) => boolean;
  isProcessingMove: boolean;
}

export const useMoveHandler = ({
  gameId,
  currentUser,
  liveGameState,
  chessGame,
  myColor,
  liveMoves,
  setLiveGameState,
  setChessGame,
  setLiveMoves,
}: UseMoveHandlerParams): UseMoveHandlerReturn => {
  const { showViolations, createViolation, clearViolations } = useViolations();
  const [isProcessingMove, setIsProcessingMove] = useState(false);
  const pendingOptimisticIdRef = useRef<string | null>(null);
  const stateSnapshotRef = useRef<{
    fen: string;
    gameState: LiveGameState;
  } | null>(null);

  const handleDrop = useCallback((from: string, to: string, piece: string): boolean => {
    if (isProcessingMove) return false;
    if (!liveGameState || !chessGame || !myColor || !gameId || !currentUser) return false;

    if (pendingOptimisticIdRef.current) {
      return false;
    }

    // Game validation
    if (liveGameState.game_ended) {
      showViolations([createViolation.gameEnded()]);
      return false;
    }

    // Turn validation
    const chessTurnToColor = chessGame.turn() === 'w' ? 'white' : 'black';
    if (chessTurnToColor !== myColor) {
      showViolations([createViolation.wrongTurn(myColor)]);
      return false;
    }

    // Piece color validation
    if (
      (myColor === 'white' && piece[0] !== 'w') ||
      (myColor === 'black' && piece[0] !== 'b')
    ) {
      showViolations([createViolation.wrongTurn(myColor)]);
      return false;
    }

    // Test move validity
    const testChess = new Chess(chessGame.fen());
    const move = testChess.move({ from, to, promotion: 'q' });
    if (!move) {
      showViolations([createViolation.invalidMove()]);
      return false;
    }

    // Capture state snapshot before optimistic update
    setIsProcessingMove(true);
    stateSnapshotRef.current = {
      fen: chessGame.fen(),
      gameState: { ...liveGameState },
    };

    // Update local state immediately
    setChessGame(testChess);
    setLiveGameState(prev =>
      prev
        ? {
            ...prev,
            current_fen: testChess.fen(),
            current_turn: prev.current_turn === 'white' ? 'black' : 'white',
            move_count: prev.move_count + 1,
          }
        : prev
    );

    // Add optimistic move
    const optimisticId = `optimistic-${Date.now()}`;
    pendingOptimisticIdRef.current = optimisticId;

    setLiveMoves(prev => {
      const currentMoveCount = liveGameState?.move_count || 0;
      const calculatedMoveNumber = currentMoveCount + 1;

      return [
        ...prev,
        {
          id: optimisticId,
          game_id: gameId,
          player_id: currentUser.id,
          move_number: calculatedMoveNumber,
          move_from: from,
          move_to: to,
          move_san: move.san,
          move_fen: testChess.fen(),
          created_at: new Date().toISOString(),
        } as LiveMove,
      ];
    });

    // Send to server
    liveMovesService
      .makeMove(gameId, from, to, 'q')
      .then(result => {
        if (!result.success) {
          // Full rollback on failure
          if (stateSnapshotRef.current) {
            const rollbackChess = new Chess(stateSnapshotRef.current.fen);
            setChessGame(rollbackChess);
            setLiveGameState(stateSnapshotRef.current.gameState);
            stateSnapshotRef.current = null;
          }

          // Remove optimistic move
          setLiveMoves(prev => prev.filter(m => m.id !== optimisticId));
          pendingOptimisticIdRef.current = null;

          showViolations([createViolation.invalidMove(result.error)]);
        } else {
          // Success - clear snapshot
          stateSnapshotRef.current = null;
          clearViolations();
        }
      })
      .catch(error => {
        // Network error - rollback
        console.error('❌ Move failed due to network error:', error);
        if (stateSnapshotRef.current) {
          const rollbackChess = new Chess(stateSnapshotRef.current.fen);
          setChessGame(rollbackChess);
          setLiveGameState(stateSnapshotRef.current.gameState);
          stateSnapshotRef.current = null;
        }
        setLiveMoves(prev => prev.filter(m => m.id !== optimisticId));
        pendingOptimisticIdRef.current = null;
        showViolations([createViolation.invalidMove('Network error')]);
      })
      .finally(() => {
        setTimeout(() => setIsProcessingMove(false), 120);
      });

    return true;
  }, [
    isProcessingMove,
    liveGameState,
    chessGame,
    myColor,
    gameId,
    currentUser,
    showViolations,
    createViolation,
    clearViolations,
    setLiveGameState,
    setChessGame,
    setLiveMoves,
  ]);

  // Clear stuck pending state
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingOptimisticIdRef.current) {
        pendingOptimisticIdRef.current = null;
        setIsProcessingMove(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    handleDrop,
    isProcessingMove,
  };
};