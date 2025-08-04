// components/LivePhase/LivePhaseScreen.tsx - FIXED LAYOUT AND BUTTON ALIGNMENT
import React, { useState, useEffect } from 'react';
import { UnifiedChessBoard } from '../shared/ChessBoard/UnifiedChessBoard';
import { useViolations } from '../shared/ViolationSystem';
import TimerPanel from './TimerPanel';
import LichessMoveHistory from './FixedMoveHistory';
import GameActionButtons from './GameActionButtons';
import FixedGameEndModal from './FixedGameEndModal';
import {
  BeautifulDrawOfferModal,
  BeautifulResignModal,
} from './ConfirmationModal';
import BlindGameSummary from './BlindGameSummary';

interface LivePhaseScreenProps {
  gameState: any;
}

interface GameResult {
  type: 'checkmate' | 'draw' | 'resignation' | 'timeout' | 'abort';
  winner: 'white' | 'black' | 'draw';
  reason: string;
}

const LivePhaseScreen: React.FC<LivePhaseScreenProps> = ({ gameState }) => {
  const { showViolations, createViolation, clearViolations } = useViolations();

  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showDrawOfferConfirm, setShowDrawOfferConfirm] = useState(false);
  const [drawOffered, setDrawOffered] = useState<'white' | 'black' | null>(
    null
  );
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const { live, timer, blind, reveal } = gameState.gameState;

  // ─────────────────────────────────────────────────────────────
  // 🎮 GAME STATUS & EFFECTS
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    updateStatus();
  }, [live.game, live.gameEnded]);

  // Listen for timeout events from timer
  useEffect(() => {
    const handleTimeout = (event: CustomEvent) => {
      if (live.gameEnded) return;

      const { player } = event.detail;
      const winner = player === 'white' ? 'black' : 'white';
      const result: GameResult = {
        type: 'timeout',
        winner,
        reason: 'timeout',
      };
      setGameResult(result);
      gameState.endGame(result);
    };

    window.addEventListener('chess-timeout', handleTimeout as EventListener);
    return () =>
      window.removeEventListener(
        'chess-timeout',
        handleTimeout as EventListener
      );
  }, [live.gameEnded, gameState]);

  const updateStatus = () => {
    if (live.gameEnded) return;

    if (live.game.isCheckmate()) {
      const winner = live.game.turn() === 'w' ? 'black' : 'white';
      const result: GameResult = {
        type: 'checkmate',
        winner,
        reason: 'checkmate',
      };
      setGameResult(result);
      gameState.endGame(result);
    } else if (live.game.isDraw()) {
      const result: GameResult = {
        type: 'draw',
        winner: 'draw',
        reason: 'stalemate',
      };
      setGameResult(result);
      gameState.endGame(result);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 🎮 MOVE HANDLING
  // ─────────────────────────────────────────────────────────────

  const handleDrop = (source: string, target: string): boolean => {
    if (live.gameEnded) {
      showViolations([createViolation.gameEnded()]);
      return false;
    }

    const piece = live.game.get(source as any);
    if (!piece) {
      showViolations([createViolation.invalidMove('No piece on that square!')]);
      return false;
    }

    const isWhitePiece = piece.color === 'w';
    const isWhiteTurn = live.game.turn() === 'w';

    if (isWhitePiece !== isWhiteTurn) {
      showViolations([
        createViolation.wrongTurn(isWhiteTurn ? 'white' : 'black'),
      ]);
      return false;
    }

    const success = gameState.makeLiveMove(source, target);
    if (success) {
      clearViolations();
      setDrawOffered(null);
    } else {
      showViolations([createViolation.invalidMove()]);
    }

    return success;
  };

  // ─────────────────────────────────────────────────────────────
  // 🎯 GAME ACTIONS
  // ─────────────────────────────────────────────────────────────

  const handleResign = () => {
    const winner = live.game.turn() === 'w' ? 'black' : 'white';
    const result: GameResult = {
      type: 'resignation',
      winner,
      reason: 'resignation',
    };
    setGameResult(result);
    gameState.endGame(result);
    setShowResignConfirm(false);
  };

  const handleOfferDraw = () => {
    setShowDrawOfferConfirm(true);
  };

  const confirmDrawOffer = () => {
    const currentPlayer = live.game.turn() === 'w' ? 'white' : 'black';
    setDrawOffered(currentPlayer);
    setShowDrawOfferConfirm(false);
  };

  const handleAcceptDraw = () => {
    const result: GameResult = {
      type: 'draw',
      winner: 'draw',
      reason: 'agreement',
    };
    setGameResult(result);
    gameState.endGame(result);
    setDrawOffered(null);
  };

  const handleDeclineDraw = () => {
    setDrawOffered(null);
  };

  // ─────────────────────────────────────────────────────────────
  // 🏁 GAME END MODAL HANDLERS
  // ─────────────────────────────────────────────────────────────

  const handleRematch = () => {
    // Reset game state for new match
    setGameResult(null);
    setDrawOffered(null);
    gameState.resetGame();
  };

  const handleLeaveTable = () => {
    // Navigate back to main menu or lobby
    setGameResult(null);
    gameState.leaveGame();
  };

  // ─────────────────────────────────────────────────────────────
  // 📊 DATA PREPARATION FOR COMPONENTS
  // ─────────────────────────────────────────────────────────────

  const getGameData = () => ({
    blind: {
      p1Moves: blind.p1Moves,
      p2Moves: blind.p2Moves,
      revealLog: reveal.moveLog,
    },
    live: {
      moves: live.moveHistory,
      currentTurn: live.game.turn(),
      gameEnded: live.gameEnded,
    },
    timers: {
      whiteTime: timer.whiteTime,
      blackTime: timer.blackTime,
      whiteTimeMs: timer.whiteTimeMs || 180000, // 3 minutes default
      blackTimeMs: timer.blackTimeMs || 180000, // 3 minutes default
    },
    drawOffered,
  });

  const gameData = getGameData();

  // Format time for display
  const formatTime = (timeMs: number): string => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // ─────────────────────────────────────────────────────────────
  // 🎬 RENDER - FIXED LAYOUT
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white overflow-x-hidden">
      <div className="p-4 scale-[0.92] origin-top mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="text-3xl">♟️</div>
            <h1 className="text-2xl font-bold text-yellow-400">
              BlindChess Live Battle
            </h1>
            <div className="text-3xl">♔</div>
          </div>
          {live.game.inCheck() && (
            <div className="text-red-400 font-bold animate-pulse">
              ⚠️ CHECK! ⚠️
            </div>
          )}
          {live.gameEnded && (
            <div className="text-green-400 font-bold">🏁 Game Over</div>
          )}
        </div>

        {/* Main Game Layout - FIXED ALIGNMENT */}
        <div className="grid grid-cols-12 gap-4 h-[540px]">
          {/* Left Column: Timers & Summary */}
          <div className="col-span-3 flex flex-col items-center justify-between">
            <TimerPanel
              label="BLACK"
              timeMs={gameData.timers.blackTimeMs}
              active={
                gameData.live.currentTurn === 'b' && !gameData.live.gameEnded
              }
            />

            <BlindGameSummary blindData={gameData.blind} />

            <TimerPanel
              label="WHITE"
              timeMs={gameData.timers.whiteTimeMs}
              active={
                gameData.live.currentTurn === 'w' && !gameData.live.gameEnded
              }
            />
          </div>

          {/* Center: Chess Board */}
          <div className="col-span-6 flex items-center justify-center">
            <UnifiedChessBoard
              fen={live.fen}
              onPieceDrop={handleDrop}
              boardWidth={500}
              gameEnded={live.gameEnded}
              currentTurn={live.game.turn()}
              lastMove={live.lastMove}
              phase="live"
            />
          </div>

          {/* Right Column: Move History + Actions - FIXED ALIGNMENT */}
          <div className="col-span-3 flex flex-col justify-between h-full">
            {/* Move History - INCREASED SIZE */}
            <div className="flex-1 mb-4">
              <LichessMoveHistory
                blindMoves={gameData.blind.revealLog}
                liveMoves={gameData.live.moves}
              />
            </div>

            {/* Action Buttons - ALIGNED WITH BOARD BOTTOM */}
            <div className="flex-shrink-0">
              {!gameData.live.gameEnded ? (
                <GameActionButtons
                  drawOffered={gameData.drawOffered}
                  currentTurn={gameData.live.currentTurn}
                  canAbort={false}
                  onResign={() => setShowResignConfirm(true)}
                  onOfferDraw={handleOfferDraw}
                  onAcceptDraw={handleAcceptDraw}
                  onDeclineDraw={handleDeclineDraw}
                  onAbort={() => {}}
                />
              ) : (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={handleRematch}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg transition-colors flex items-center justify-center text-lg"
                      title="Request Rematch"
                    >
                      🔄
                    </button>
                    <button
                      onClick={handleLeaveTable}
                      className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition-colors flex items-center justify-center text-lg"
                      title="Leave Game"
                    >
                      🚪
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BeautifulResignModal
        isOpen={showResignConfirm}
        onConfirm={handleResign}
        onCancel={() => setShowResignConfirm(false)}
        currentPlayer={live.game.turn() === 'w' ? 'white' : 'black'}
      />
      <BeautifulDrawOfferModal
        isOpen={showDrawOfferConfirm}
        onConfirm={confirmDrawOffer}
        onCancel={() => setShowDrawOfferConfirm(false)}
        currentPlayer={live.game.turn() === 'w' ? 'white' : 'black'}
      />
      {gameResult && (
        <FixedGameEndModal
          result={gameResult}
          onRematch={handleRematch}
          onLeaveTable={handleLeaveTable}
          gameHistory={{
            blindPhaseData: {
              revealLog: gameData.blind.revealLog,
              p1BlindMoves: gameData.blind.p1Moves,
              p2BlindMoves: gameData.blind.p2Moves,
            },
            livePhaseData: {
              moves: gameData.live.moves,
            },
          }}
          isVisible={!!gameResult}
        />
      )}
    </div>
  );
};

export default LivePhaseScreen;
