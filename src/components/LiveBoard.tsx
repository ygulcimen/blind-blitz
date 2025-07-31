// components/LiveBoard.tsx - Enhanced version with PremoveBoard UX
import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import type { GameResult, BlindMoveStats } from './GameEndModal';
import GameEndModal from './GameEndModal';
import { normalizeStartingFen, getWhiteBlackMoves } from '../utils/chessUtils';
import GameHeader from './LiveBoard/GameHeader';
import GameLayout from './LiveBoard/GameLayout';
import GameControls from './LiveBoard/GameControls';
import ConfirmationModal from './LiveBoard/ConfirmationModal';
import BottomBanner from './LiveBoard/BottomBanner';
import ViolationToast from './LiveBoard/ViolationToast';
import { useViolationToast } from './LiveBoard/useViolationToast';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
}

interface Props {
  startingFen: string;
  blindMoveLog?: MoveLogItem[];
  onGameEnd?: (result: GameResult) => void;
  onAbortGame?: () => void;
  onRematch?: () => void;
  onLeaveTable?: () => void;
}

const LiveBoard = ({
  startingFen,
  blindMoveLog = [],
  onGameEnd,
  onAbortGame,
  onRematch,
  onLeaveTable,
}: Props) => {
  // Chess timer configuration (3+2 Blitz)
  const INITIAL_TIME = 3 * 60 * 1000; // 3 minutes in milliseconds
  const INCREMENT = 2 * 1000; // 2 second increment

  // Game state
  const [game, setGame] = useState(
    () => new Chess(normalizeStartingFen(startingFen))
  );
  const [fen, setFen] = useState(() => normalizeStartingFen(startingFen));
  const [status, setStatus] = useState('');
  const [liveMoveHistory, setLiveMoveHistory] = useState<string[]>([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [drawOffered, setDrawOffered] = useState<'white' | 'black' | null>(
    null
  );
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null
  );

  // Enhanced UX - Violation system
  const {
    violations,
    showViolation,
    showViolationTemporarily,
    clearViolations,
    createViolation,
  } = useViolationToast();

  // Modal states
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);

  // Timer states
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Game status effect
  useEffect(() => {
    updateStatus();
  }, [game]);

  // Timer effect with enhanced warnings
  useEffect(() => {
    if (isTimerRunning && !gameEnded) {
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastTickRef.current;
        lastTickRef.current = now;

        if (game.turn() === 'w') {
          setWhiteTime((prev) => {
            const newTime = Math.max(0, prev - elapsed);

            // Show time warning when under 30 seconds
            if (newTime <= 30000 && newTime > 29000 && prev > 30000) {
              showViolationTemporarily([createViolation.timeRunning()], 1500);
            }

            if (newTime === 0) {
              handleTimeout('black');
            }
            return newTime;
          });
        } else {
          setBlackTime((prev) => {
            const newTime = Math.max(0, prev - elapsed);

            // Show time warning when under 30 seconds
            if (newTime <= 30000 && newTime > 29000 && prev > 30000) {
              showViolationTemporarily([createViolation.timeRunning()], 1500);
            }

            if (newTime === 0) {
              handleTimeout('white');
            }
            return newTime;
          });
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, gameEnded, game.turn()]);

  const handleTimeout = (winner: 'white' | 'black') => {
    const result: GameResult = {
      type: 'timeout',
      winner,
      reason: 'timeout',
    };

    setStatus(
      `⏰ Time's up! ${winner === 'white' ? 'White' : 'Black'} wins on time!`
    );
    setGameEnded(true);
    setIsTimerRunning(false);
    setGameResult(result);

    setTimeout(() => {
      setShowModal(true);
    }, 2000);

    onGameEnd?.(result);
  };

  // Enhanced drop handler with better validation and feedback
  const handleDrop = (source: string, target: string): boolean => {
    if (gameEnded) {
      showViolationTemporarily([createViolation.gameEnded()]);
      return false;
    }

    try {
      // Check if it's the correct player's turn
      const piece = game.get(source as any); // Type assertion to handle chess.js Square type
      if (!piece) {
        showViolationTemporarily([
          createViolation.invalidMove('No piece on that square!'),
        ]);
        return false;
      }

      const isWhitePiece = piece.color === 'w';
      const isWhiteTurn = game.turn() === 'w';

      if (isWhitePiece !== isWhiteTurn) {
        showViolationTemporarily([
          createViolation.wrongTurn(isWhiteTurn ? 'white' : 'black'),
        ]);
        return false;
      }

      // Create a copy of the game to test the move
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: source as any,
        to: target as any,
        promotion: 'q',
      });

      if (move === null) {
        showViolationTemporarily([createViolation.invalidMove()]);
        return false;
      }

      // If the king would still be in check after this move, it's invalid
      if (gameCopy.inCheck()) {
        const kingColor = game.turn() === 'w' ? 'white' : 'black';
        showViolationTemporarily([createViolation.inCheck(kingColor)]);
        return false;
      }

      // If move is valid, apply it to the actual game
      const actualMove = game.move({
        from: source as any,
        to: target as any,
        promotion: 'q',
      });
      if (actualMove === null) {
        showViolationTemporarily([createViolation.invalidMove()]);
        return false;
      }

      // Store last move for highlighting
      setLastMove({ from: source, to: target });

      // Add increment and switch timer
      if (game.turn() === 'b') {
        setWhiteTime((prev) => prev + INCREMENT);
      } else {
        setBlackTime((prev) => prev + INCREMENT);
      }

      lastTickRef.current = Date.now();

      // Update game state with smooth animation delay
      setTimeout(() => setFen(game.fen()), 50);
      setLiveMoveHistory((prev) => [...prev, actualMove.san]);
      setDrawOffered(null);

      // Clear any existing violations on successful move
      clearViolations();

      updateStatus();
      return true;
    } catch (error) {
      console.error('Move error:', error);
      showViolationTemporarily([
        createViolation.invalidMove('Something went wrong with that move.'),
      ]);
      return false;
    }
  };

  const updateStatus = () => {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'black' : 'white';
      const result: GameResult = {
        type: 'checkmate',
        winner,
        reason: 'checkmate',
      };

      setStatus(
        `🏆 Checkmate! ${winner === 'white' ? 'White' : 'Black'} wins!`
      );
      setGameEnded(true);
      setIsTimerRunning(false);
      setGameResult(result);

      setTimeout(() => {
        setShowModal(true);
      }, 3000);

      onGameEnd?.(result);
    } else if (game.isDraw()) {
      const result: GameResult = {
        type: 'draw',
        winner: 'draw',
        reason: 'stalemate',
      };

      setStatus('🤝 Draw! Game ends in a tie');
      setGameEnded(true);
      setIsTimerRunning(false);
      setGameResult(result);

      setTimeout(() => {
        setShowModal(true);
      }, 2500);

      onGameEnd?.(result);
    } else if (game.inCheck()) {
      setStatus(`⚠️ ${game.turn() === 'w' ? 'White' : 'Black'} is in check!`);
    } else {
      setStatus(`${game.turn() === 'w' ? '⚪ White' : '⚫ Black'} to move`);
    }
  };

  const handleResign = () => {
    const winner = game.turn() === 'w' ? 'black' : 'white';
    const result: GameResult = {
      type: 'resignation',
      winner,
      reason: 'resignation',
    };

    setGameEnded(true);
    setIsTimerRunning(false);
    setGameResult(result);
    setShowResignConfirm(false);
    setShowModal(true);

    onGameEnd?.(result);
  };

  const handleOfferDraw = () => {
    const currentPlayer = game.turn() === 'w' ? 'white' : 'black';
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

    setGameEnded(true);
    setIsTimerRunning(false);
    setGameResult(result);
    setDrawOffered(null);
    setShowModal(true);

    onGameEnd?.(result);
  };

  const handleDeclineDraw = () => {
    setDrawOffered(null);
    updateStatus();
  };

  const handleAbortGame = () => {
    setShowAbortConfirm(false);
    const result: GameResult = {
      type: 'abort',
      winner: 'draw',
      reason: 'abort',
    };
    setGameResult(result);
    onAbortGame?.();
  };

  const handleRematch = () => {
    // Reset all game state
    const newGame = new Chess(normalizeStartingFen(startingFen));
    setGame(newGame);
    setFen(normalizeStartingFen(startingFen));
    setGameResult(null);
    setShowModal(false);
    setGameEnded(false);
    setLiveMoveHistory([]);
    setDrawOffered(null);
    setLastMove(null);

    // Clear violations
    clearViolations();

    // Reset timers
    setWhiteTime(INITIAL_TIME);
    setBlackTime(INITIAL_TIME);
    setIsTimerRunning(true);
    lastTickRef.current = Date.now();

    onRematch?.();
  };

  const handleLeaveTable = () => {
    setGameResult(null);
    setShowModal(false);
    clearViolations();
    onLeaveTable?.();
  };

  // Calculate move statistics
  const { whiteMoves, blackMoves } = getWhiteBlackMoves(blindMoveLog);
  const totalBlindMoves = blindMoveLog.length;
  const totalMoves = totalBlindMoves + liveMoveHistory.length;

  const blindMoveStats: BlindMoveStats = {
    totalBlindMoves,
    whiteBlindMoves: whiteMoves.length,
    blackBlindMoves: blackMoves.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Enhanced Violation Toast - positioned above everything */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
        <ViolationToast show={showViolation} violations={violations} />
      </div>

      <div className="relative z-10 pt-8 pb-8 px-4 lg:px-8">
        {/* Game Header */}
        <GameHeader
          status={status}
          gameEnded={gameEnded}
          inCheck={game.inCheck()}
        />

        {/* Main Game Layout - Enhanced with new props */}
        <GameLayout
          fen={fen}
          onPieceDrop={handleDrop}
          gameEnded={gameEnded}
          currentTurn={game.turn()}
          lastMove={lastMove}
          whiteTime={whiteTime}
          blackTime={blackTime}
          totalMoves={totalMoves}
          blindMoves={totalBlindMoves}
          liveMoves={liveMoveHistory.length}
          whiteMoves={whiteMoves}
          blackMoves={blackMoves}
          liveMoveHistory={liveMoveHistory}
        />

        {/* Game Controls */}
        <GameControls
          gameEnded={gameEnded}
          drawOffered={drawOffered}
          currentTurn={game.turn()}
          liveMoveCount={liveMoveHistory.length}
          onResign={() => setShowResignConfirm(true)}
          onOfferDraw={handleOfferDraw}
          onAcceptDraw={handleAcceptDraw}
          onDeclineDraw={handleDeclineDraw}
          onAbort={() => setShowAbortConfirm(true)}
        />

        {/* Bottom Banner */}
        <BottomBanner />
      </div>

      {/* Game End Modal */}
      {gameResult && showModal && (
        <GameEndModal
          result={gameResult}
          blindMoveStats={blindMoveStats}
          liveMoves={liveMoveHistory.length}
          isVisible={showModal}
          onRematch={handleRematch}
          onLeaveTable={handleLeaveTable}
        />
      )}

      {/* Confirmation Modals */}
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

export default LiveBoard;
