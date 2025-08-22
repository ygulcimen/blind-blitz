// Enhanced LivePhaseScreen with better game end handling
import React, { useState, useEffect } from 'react';
import { UnifiedChessBoard } from '../shared/ChessBoard/UnifiedChessBoard';
import { useViolations } from '../shared/ViolationSystem';
import { WarriorCard } from './WarriorCard';
import { WarMoveHistory } from './WarMoveHistory';
import { WarActions } from './WarActions';
import { WarModal } from './WarModal';
import { EnhancedWarEndModal } from './EnhancedWarEndModal';

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
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [gameEndStatus, setGameEndStatus] = useState<string | null>(null); // New status display

  const { live, timer, blind, reveal } = gameState.gameState;

  // Mock player data (replace with real data)
  const players = {
    white: { name: 'ChessKnight', rating: 1650, isHost: true },
    black: { name: 'GrandSlayer', rating: 1847, isHost: false },
  };

  // ─────────────────────────────────────────────────────────────
  // 🎮 ENHANCED GAME STATUS & EFFECTS
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    updateStatus();
  }, [live.game, live.gameEnded]);

  useEffect(() => {
    const handleTimeout = (event: CustomEvent) => {
      if (live.gameEnded) return;
      const { player } = event.detail;
      const winner = player === 'white' ? 'black' : 'white';
      const result: GameResult = { type: 'timeout', winner, reason: 'timeout' };

      // Show status first, then modal after delay
      setGameEndStatus(`⏰ ${winner.toUpperCase()} WINS BY TIME!`);
      setGameResult(result);

      setTimeout(() => {
        setShowGameEndModal(true);
        setGameEndStatus(null);
      }, 1500); // Show status for 1.5 seconds

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

      // Show status first, then modal after delay
      setGameEndStatus(`👑 ${winner.toUpperCase()} WINS BY CHECKMATE!`);
      setGameResult(result);

      setTimeout(() => {
        setShowGameEndModal(true);
        setGameEndStatus(null);
      }, 2000); // Show status for 2 seconds

      gameState.endGame(result);
    } else if (live.game.isDraw()) {
      const result: GameResult = {
        type: 'draw',
        winner: 'draw',
        reason: 'stalemate',
      };

      setGameEndStatus('⚖️ DRAW!');
      setGameResult(result);

      setTimeout(() => {
        setShowGameEndModal(true);
        setGameEndStatus(null);
      }, 1500);

      gameState.endGame(result);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 🎮 MOVE HANDLING (same as before)
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
  // 🎯 GAME ACTIONS (same as before)
  // ─────────────────────────────────────────────────────────────

  const handleResign = () => {
    const winner = live.game.turn() === 'w' ? 'black' : 'white';
    const result: GameResult = {
      type: 'resignation',
      winner,
      reason: 'resignation',
    };
    setGameResult(result);
    setShowGameEndModal(true);
    gameState.endGame(result);
    setShowResignConfirm(false);
  };

  const handleOfferDraw = () => {
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
    setShowGameEndModal(true);
    gameState.endGame(result);
    setDrawOffered(null);
  };

  const handleDeclineDraw = () => setDrawOffered(null);

  const handleRematch = () => {
    setGameResult(null);
    setShowGameEndModal(false);
    setDrawOffered(null);
    setGameEndStatus(null);
    gameState.resetGame();
  };

  const handleLeaveTable = () => {
    if (
      window.confirm(
        '⚠️ SURRENDER WARNING ⚠️\n\nLeaving the battlefield will count as a RESIGNATION and your opponent will be declared victorious!\n\nAre you sure you want to surrender?'
      )
    ) {
      window.location.href = '/games';
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 🎬 ENHANCED WAR MODE RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex overflow-hidden relative">
      {/* WAR BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500/[0.07] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/[0.05] rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-yellow-500/[0.04] rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* 🎯 COMPACT GAME END STATUS OVERLAY */}
      {gameEndStatus && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-xl blur-lg animate-pulse" />
            <div className="relative bg-gray-900/95 border border-red-500/50 rounded-xl px-6 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {gameResult?.type === 'checkmate'
                    ? '👑'
                    : gameResult?.type === 'timeout'
                    ? '⏰'
                    : '⚖️'}
                </div>
                <h1 className="text-xl font-bold text-white">
                  {gameEndStatus}
                </h1>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left: Warriors */}
      <div className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col justify-between relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex justify-end">
            <WarriorCard
              player="black"
              playerData={players.black}
              timeMs={timer.blackTime}
              active={live.game?.turn() === 'b' && !live.gameEnded}
            />
          </div>
          <div className="flex justify-end">
            <WarriorCard
              player="white"
              playerData={players.white}
              timeMs={timer.whiteTime}
              active={live.game?.turn() === 'w' && !live.gameEnded}
            />
          </div>
        </div>
      </div>

      {/* Center: BATTLEFIELD */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-3xl blur-xl animate-pulse" />
          <div className="relative z-10">
            <UnifiedChessBoard
              fen={live.fen}
              game={live.game} // FIXED: Added game prop
              onPieceDrop={handleDrop}
              boardWidth={Math.min(
                700,
                window.innerWidth * 0.5,
                window.innerHeight * 0.85
              )}
              gameEnded={live.gameEnded}
              currentTurn={live.game?.turn()}
              lastMove={live.lastMove}
              phase="live"
            />
          </div>
        </div>
      </div>

      {/* Right: War Move History + Actions */}
      <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-1 mb-6">
            <WarMoveHistory
              liveMoves={live.moveHistory || []}
              blindMoves={reveal.moveLog || []}
            />
          </div>
          <div className="flex-shrink-0">
            <WarActions
              gameEnded={live.gameEnded}
              drawOffered={drawOffered}
              currentTurn={live.game?.turn()}
              onResign={() => setShowResignConfirm(true)}
              onOfferDraw={() => setShowDrawOfferConfirm(true)}
              onAcceptDraw={handleAcceptDraw}
              onDeclineDraw={handleDeclineDraw}
              onRematch={handleRematch}
              onLeave={handleLeaveTable}
            />
          </div>
        </div>
      </div>

      {/* WAR MODALS */}
      <WarModal
        isOpen={showResignConfirm}
        title="SURRENDER BATTLE?"
        message="Are you sure you want to surrender this epic war? Your opponent will claim total victory!"
        confirmText="Surrender"
        confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={handleResign}
        onCancel={() => setShowResignConfirm(false)}
        icon="🏳️"
      />

      <WarModal
        isOpen={showDrawOfferConfirm}
        title="OFFER PEACE TREATY?"
        message="Do you want to offer your opponent an honorable ceasefire? The war will end if they accept."
        confirmText="Offer Peace"
        confirmColor="bg-blue-600 hover:bg-blue-700"
        onConfirm={handleOfferDraw}
        onCancel={() => setShowDrawOfferConfirm(false)}
        icon="🤝"
      />

      {/* ENHANCED GAME END MODAL */}
      <EnhancedWarEndModal
        isOpen={showGameEndModal}
        gameResult={gameResult}
        onRematch={handleRematch}
        onLeave={() => setShowGameEndModal(false)}
      />
    </div>
  );
};
export default LivePhaseScreen;
