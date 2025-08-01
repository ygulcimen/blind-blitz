// components/LivePhase/LivePhaseScreen.tsx
import React, { useState, useEffect } from 'react';
import { UnifiedChessBoard } from '../shared/ChessBoard/UnifiedChessBoard';
import { useViolations } from '../shared/ViolationSystem';
import TimerPanel from './TimerPanel';
import GameControls from './GameControls';
import MoveHistory from './MoveHistory';
import GameEndModal from '../GameEndModal';
import ConfirmationModal from './ConfirmationModal';

interface LivePhaseScreenProps {
  gameState: any; // GameStateManager instance
}

interface GameResult {
  type: 'checkmate' | 'draw' | 'resignation' | 'timeout' | 'abort';
  winner: 'white' | 'black' | 'draw';
  reason: string;
}

const LivePhaseScreen: React.FC<LivePhaseScreenProps> = ({ gameState }) => {
  const { showViolations, createViolation, clearViolations } = useViolations();

  // ─────────────────────────────────────────────────────────────
  // 🏗️ LOCAL STATE
  // ─────────────────────────────────────────────────────────────

  const [status, setStatus] = useState('');
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [drawOffered, setDrawOffered] = useState<'white' | 'black' | null>(
    null
  );

  const { live, timer, blind } = gameState.gameState;

  // ─────────────────────────────────────────────────────────────
  // 🎮 GAME STATUS UPDATES
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    updateStatus();
  }, [live.game, live.gameEnded]);

  useEffect(() => {
    if (live.gameResult && !showGameEndModal) {
      setTimeout(() => setShowGameEndModal(true), 2000);
    }
  }, [live.gameResult, showGameEndModal]);

  const updateStatus = () => {
    if (live.gameEnded) return;

    if (live.game.isCheckmate()) {
      const winner = live.game.turn() === 'w' ? 'black' : 'white';
      const result: GameResult = {
        type: 'checkmate',
        winner,
        reason: 'checkmate',
      };

      setStatus(
        `🏆 Checkmate! ${winner === 'white' ? 'White' : 'Black'} wins!`
      );
      gameState.endGame(result);
    } else if (live.game.isDraw()) {
      const result: GameResult = {
        type: 'draw',
        winner: 'draw',
        reason: 'stalemate',
      };

      setStatus('🤝 Draw! Game ends in a tie');
      gameState.endGame(result);
    } else if (live.game.inCheck()) {
      setStatus(
        `⚠️ ${live.game.turn() === 'w' ? 'White' : 'Black'} is in check!`
      );
    } else {
      setStatus(
        `${live.game.turn() === 'w' ? '⚪ White' : '⚫ Black'} to move`
      );
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

    // Check piece ownership
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

    // Try the move
    const success = gameState.makeLiveMove(source, target);

    if (!success) {
      // Check for specific chess violations
      if (live.game.inCheck()) {
        showViolations([
          createViolation.inCheck(live.game.turn() === 'w' ? 'white' : 'black'),
        ]);
      } else {
        showViolations([createViolation.invalidMove()]);
      }
      return false;
    }

    // Clear violations on successful move
    clearViolations();
    setDrawOffered(null); // Clear any draw offers
    return true;
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

    gameState.endGame(result);
    setShowResignConfirm(false);
  };

  const handleOfferDraw = () => {
    const currentPlayer = live.game.turn() === 'w' ? 'white' : 'black';
    setDrawOffered(currentPlayer);
    setStatus(
      `🤝 ${currentPlayer === 'white' ? 'White' : 'Black'} offers a draw`
    );
  };

  const handleAcceptDraw = () => {
    const result: GameResult = {
      type: 'draw',
      winner: 'draw',
      reason: 'agreement',
    };

    gameState.endGame(result);
    setDrawOffered(null);
  };

  const handleDeclineDraw = () => {
    setDrawOffered(null);
    updateStatus();
  };

  const handleAbortGame = () => {
    const result: GameResult = {
      type: 'abort',
      winner: 'draw',
      reason: 'abort',
    };

    gameState.endGame(result);
    setShowAbortConfirm(false);
  };

  const handleRematch = () => {
    gameState.resetGame();
    setShowGameEndModal(false);
    setDrawOffered(null);
    clearViolations();
  };

  const handleLeaveTable = () => {
    gameState.resetGame();
    setShowGameEndModal(false);
  };

  // ─────────────────────────────────────────────────────────────
  // 🎨 RENDER HELPERS
  // ─────────────────────────────────────────────────────────────

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusStyles = () => {
    if (live.gameEnded) {
      return 'from-red-500/20 to-orange-500/20 border-red-500/30';
    }
    if (live.game.inCheck()) {
      return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
    }
    return 'from-blue-500/20 to-purple-500/20 border-blue-500/30';
  };

  // ─────────────────────────────────────────────────────────────
  // 🎬 RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 pt-8 pb-8 px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-4 lg:mb-6 max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            ⚡ LIVE BATTLE ⚡
          </h1>

          <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10 shadow-lg inline-block mb-3">
            <p className="text-sm sm:text-base lg:text-lg text-white font-bold">
              🔥 3+2 BLITZ 🔥
            </p>
          </div>

          <div
            className={`bg-gradient-to-r ${getStatusStyles()} backdrop-blur-sm rounded-lg px-4 py-2 border shadow-lg inline-block`}
          >
            <p className="text-sm sm:text-base font-bold text-white flex items-center justify-center gap-2">
              {live.gameEnded ? '🏁' : live.game.inCheck() ? '⚠️' : '⚔️'}
              {status}
              {!live.gameEnded && <span className="animate-pulse">|</span>}
            </p>
          </div>
        </div>

        {/* Main Game Layout */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          {/* Mobile/Tablet Layout */}
          <div className="flex flex-col xl:hidden gap-3 sm:gap-4">
            {/* Timers */}
            <div className="flex justify-between gap-2 sm:gap-3">
              <TimerPanel
                label="BLACK"
                time={formatTime(timer.blackTime)}
                active={live.game.turn() === 'b' && !live.gameEnded}
                timeMs={timer.blackTime}
              />
              <TimerPanel
                label="WHITE"
                time={formatTime(timer.whiteTime)}
                active={live.game.turn() === 'w' && !live.gameEnded}
                timeMs={timer.whiteTime}
              />
            </div>

            {/* Board */}
            <div className="flex justify-center">
              <UnifiedChessBoard
                fen={live.fen}
                onPieceDrop={handleDrop}
                boardWidth={Math.min(500, window.innerWidth - 40)}
                gameEnded={live.gameEnded}
                currentTurn={live.game.turn()}
                lastMove={live.lastMove}
                phase="live"
              />
            </div>

            {/* Move History */}
            <MoveHistory
              blindMoves={blind.p1Moves.concat(blind.p2Moves)}
              liveMoves={live.moveHistory}
              compact={true}
            />
          </div>

          {/* Desktop Layout */}
          <div className="hidden xl:grid xl:grid-cols-12 gap-6 items-start">
            {/* Left Column */}
            <div className="xl:col-span-3 flex flex-col gap-4">
              <TimerPanel
                label="BLACK"
                time={formatTime(timer.blackTime)}
                active={live.game.turn() === 'b' && !live.gameEnded}
                timeMs={timer.blackTime}
              />
            </div>

            {/* Center - Board */}
            <div className="xl:col-span-6 flex justify-center">
              <UnifiedChessBoard
                fen={live.fen}
                onPieceDrop={handleDrop}
                boardWidth={Math.min(550, window.innerHeight - 200)}
                gameEnded={live.gameEnded}
                currentTurn={live.game.turn()}
                lastMove={live.lastMove}
                phase="live"
              />
            </div>

            {/* Right Column */}
            <div className="xl:col-span-3 flex flex-col gap-4">
              <TimerPanel
                label="WHITE"
                time={formatTime(timer.whiteTime)}
                active={live.game.turn() === 'w' && !live.gameEnded}
                timeMs={timer.whiteTime}
              />
              <MoveHistory
                blindMoves={blind.p1Moves.concat(blind.p2Moves)}
                liveMoves={live.moveHistory}
                compact={false}
              />
            </div>
          </div>
        </div>

        {/* Game Controls */}
        {!live.gameEnded && (
          <GameControls
            drawOffered={drawOffered}
            currentTurn={live.game.turn()}
            liveMoveCount={live.moveHistory.length}
            onResign={() => setShowResignConfirm(true)}
            onOfferDraw={handleOfferDraw}
            onAcceptDraw={handleAcceptDraw}
            onDeclineDraw={handleDeclineDraw}
            onAbort={() => setShowAbortConfirm(true)}
          />
        )}
      </div>

      {/* Modals */}
      {live.gameResult && showGameEndModal && (
        <GameEndModal
          result={live.gameResult}
          onRematch={handleRematch}
          onLeaveTable={handleLeaveTable}
          blindMoveStats={{
            totalBlindMoves: blind.p1Moves.length + blind.p2Moves.length,
            whiteBlindMoves: blind.p1Moves.length,
            blackBlindMoves: blind.p2Moves.length,
          }}
          liveMoves={live.moveHistory.length}
          isVisible={showGameEndModal}
        />
      )}

      <ConfirmationModal
        isOpen={showResignConfirm}
        type="resign"
        onConfirm={handleResign}
        onCancel={() => setShowResignConfirm(false)}
      />

      <ConfirmationModal
        isOpen={showAbortConfirm}
        type="abort"
        onConfirm={handleAbortGame}
        onCancel={() => setShowAbortConfirm(false)}
      />
    </div>
  );
};

export default LivePhaseScreen;
