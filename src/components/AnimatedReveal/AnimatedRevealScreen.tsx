// components/AnimatedReveal/AnimatedRevealScreen.tsx
import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { UnifiedChessBoard } from '../shared/ChessBoard/UnifiedChessBoard';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
}

interface AnimatedRevealScreenProps {
  initialFen: string;
  moveLog: MoveLogItem[];
  finalFen: string;
  onRevealComplete: () => void;
}

const AnimatedRevealScreen: React.FC<AnimatedRevealScreenProps> = ({
  initialFen,
  moveLog,
  finalFen,
  onRevealComplete,
}) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [displayFen, setDisplayFen] = useState(initialFen);
  const [showMoveEffect, setShowMoveEffect] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [currentMove, setCurrentMove] = useState<MoveLogItem | null>(null);

  const totalMoves = moveLog.length;
  const remainingMoves = Math.max(0, totalMoves - currentMoveIndex - 1);
  const progressPercentage =
    totalMoves > 0 ? ((currentMoveIndex + 1) / totalMoves) * 100 : 0;

  // ─────────────────────────────────────────────────────────────
  // 🎬 SIMULATION LOGIC (Simplified)
  // ─────────────────────────────────────────────────────────────

  const generateBoardStates = (): string[] => {
    const states = [initialFen];
    const game = new Chess(initialFen);

    // Simple approach: try to apply each move in order
    moveLog.forEach((move) => {
      if (move.from && move.to && !move.isInvalid) {
        try {
          const result = game.move({
            from: move.from as any,
            to: move.to as any,
            promotion: 'q',
          });

          if (result) {
            states.push(game.fen());
          } else {
            // Move failed, but add current state anyway
            states.push(game.fen());
          }
        } catch (error) {
          // Move failed, add current state
          states.push(game.fen());
        }
      } else {
        // Invalid move, add current state
        states.push(game.fen());
      }
    });

    return states;
  };

  const [boardStates] = useState(() => generateBoardStates());

  // ─────────────────────────────────────────────────────────────
  // 🎭 ANIMATION FLOW
  // ─────────────────────────────────────────────────────────────

  // Auto-start after brief pause
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsStarting(false);
      if (totalMoves > 0) {
        playNextMove();
      } else {
        // No moves to show, complete immediately
        setTimeout(() => onRevealComplete(), 1000);
      }
    }, 800);

    return () => clearTimeout(startTimer);
  }, [totalMoves, onRevealComplete]);

  // Auto-play moves
  useEffect(() => {
    if (
      !isStarting &&
      currentMoveIndex >= 0 &&
      currentMoveIndex < totalMoves - 1
    ) {
      const timer = setTimeout(() => {
        playNextMove();
      }, 1200);

      return () => clearTimeout(timer);
    } else if (
      currentMoveIndex >= totalMoves - 1 &&
      !isStarting &&
      totalMoves > 0
    ) {
      // Animation complete
      const endTimer = setTimeout(() => {
        onRevealComplete();
      }, 1500);

      return () => clearTimeout(endTimer);
    }
  }, [currentMoveIndex, isStarting, totalMoves, onRevealComplete]);

  const playNextMove = () => {
    const nextIndex = currentMoveIndex + 1;

    if (nextIndex >= totalMoves) {
      onRevealComplete();
      return;
    }

    // Show move effect
    setShowMoveEffect(true);
    setTimeout(() => setShowMoveEffect(false), 600);

    // Update current move
    setCurrentMove(moveLog[nextIndex]);

    // Update board state
    if (nextIndex + 1 < boardStates.length) {
      setDisplayFen(boardStates[nextIndex + 1]);
    } else {
      setDisplayFen(finalFen);
    }

    setCurrentMoveIndex(nextIndex);
  };

  // ─────────────────────────────────────────────────────────────
  // 🎨 UI HELPERS
  // ─────────────────────────────────────────────────────────────

  const getPlayerIcon = (player: 'P1' | 'P2') => {
    return player === 'P1' ? '⚪' : '⚫';
  };

  const getMoveStatusIcon = (isInvalid: boolean) => {
    return isInvalid ? '💥' : '⚡';
  };

  // ─────────────────────────────────────────────────────────────
  // 🎬 RENDER
  // ─────────────────────────────────────────────────────────────

  // Handle empty move log
  if (totalMoves === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            🤔 No Moves to Reveal
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            Both players made no valid moves! Starting fresh battle...
          </p>
          <div className="text-gray-400 animate-pulse">
            Proceeding to live game...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="pt-8 pb-8 px-4 lg:px-8 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <div className="text-center mb-6 max-w-4xl mx-auto">
          {isStarting ? (
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
                ⚔️ The Chaos Unfolds ⚔️
              </h2>
              <p className="text-xl lg:text-2xl text-gray-300 font-medium">
                {totalMoves} moves colliding in blind warfare...
              </p>
              <div className="text-gray-400 text-lg animate-bounce">
                🎬 Starting reveal...
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                ⚔️ Battle in Progress ⚔️
              </h2>

              {/* Current Move Display */}
              {currentMove && currentMoveIndex >= 0 && (
                <div
                  className={`mt-4 bg-gray-800/90 rounded-xl px-6 py-4 backdrop-blur border-2 transition-all duration-300 ${
                    showMoveEffect
                      ? 'scale-105 border-yellow-400 shadow-xl shadow-yellow-400/30'
                      : 'border-gray-600'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">
                    Move {currentMoveIndex + 1} of {totalMoves}
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold mb-2">
                    {getMoveStatusIcon(currentMove.isInvalid)}
                    <span
                      className={`ml-2 ${
                        currentMove.isInvalid
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}
                    >
                      {currentMove.san}
                    </span>
                  </div>
                  {currentMove.isInvalid && (
                    <div className="text-red-400 text-lg font-bold animate-pulse mb-1">
                      REJECTED!
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-3 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      {getPlayerIcon(currentMove.player)}
                      <span className="font-bold">
                        {currentMove.player === 'P1' ? 'White' : 'Black'}
                      </span>
                    </span>
                    {remainingMoves > 0 && (
                      <>
                        <span>•</span>
                        <span>{remainingMoves} remaining</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Chess Board with Enhanced Effects */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Animated Background Effect */}
            <div
              className={`absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-xl blur transition-all duration-300 ${
                showMoveEffect ? 'opacity-50 animate-pulse' : 'opacity-20'
              }`}
            />

            {/* Chess Board */}
            <div className="relative">
              <UnifiedChessBoard
                fen={displayFen}
                boardWidth={Math.min(480, window.innerWidth - 80)}
                phase="reveal"
                showMoveEffect={showMoveEffect}
                animationDuration={800}
                gameEnded={false}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span className="font-medium">🎭 Chaos Progress</span>
              <span className="font-bold">
                {currentMoveIndex >= 0 ? currentMoveIndex + 1 : 0}/{totalMoves}
              </span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out relative"
                style={{
                  width: `${
                    currentMoveIndex >= 0
                      ? ((currentMoveIndex + 1) / totalMoves) * 100
                      : 0
                  }%`,
                }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            {progressPercentage >= 100 && (
              <div className="text-center text-green-400 font-bold text-sm mt-2 animate-bounce">
                🎉 Chaos Complete! Entering battle...
              </div>
            )}
          </div>

          {/* Recent Moves Preview */}
          {!isStarting && totalMoves > 0 && (
            <div className="bg-gray-800/50 rounded-lg px-4 py-3 backdrop-blur max-w-sm">
              <div className="text-center text-gray-400 text-xs mb-2 font-medium">
                📜 Recent Moves
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {moveLog
                  .slice(
                    Math.max(0, currentMoveIndex - 2),
                    currentMoveIndex + 1
                  )
                  .map((move, i) => {
                    const actualIndex = Math.max(0, currentMoveIndex - 2) + i;
                    const isCurrent = actualIndex === currentMoveIndex;

                    return (
                      <div
                        key={actualIndex}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all duration-300
                        ${
                          isCurrent
                            ? 'bg-blue-600 text-white scale-110 shadow-lg'
                            : 'bg-gray-700 text-gray-300'
                        }
                      `}
                      >
                        <span className="font-mono">{actualIndex + 1}.</span>
                        <span
                          className={`font-bold ${
                            move.isInvalid ? 'text-red-300' : ''
                          }`}
                        >
                          {move.san}
                        </span>
                        <span className="text-xs">
                          {getPlayerIcon(move.player)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status */}
        <div className="text-center text-gray-400 max-w-xl mx-auto mt-4">
          <p className="text-sm">
            {isStarting
              ? '🎬 Preparing the battlefield revelation...'
              : currentMoveIndex >= totalMoves - 1
              ? '✨ Chaos resolved! Proceeding to live combat...'
              : '🎭 Each move reshapes the battle...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnimatedRevealScreen;
