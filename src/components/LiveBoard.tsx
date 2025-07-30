// components/LiveBoard.tsx
import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { GameResult, BlindMoveStats } from './GameEndModal';
import GameEndModal from './GameEndModal';

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

  // Ensure White always starts in live phase by forcing turn to 'w'
  const normalizeStartingFen = (fen: string) => {
    const parts = fen.split(' ');
    if (parts.length >= 2) {
      parts[1] = 'w'; // Force White to move first
      return parts.join(' ');
    }
    return fen;
  };

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
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);

  // Timer states
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    updateStatus();
  }, [game]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && !gameEnded) {
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastTickRef.current;
        lastTickRef.current = now;

        if (game.turn() === 'w') {
          setWhiteTime((prev) => {
            const newTime = Math.max(0, prev - elapsed);
            if (newTime === 0) {
              handleTimeout('black');
            }
            return newTime;
          });
        } else {
          setBlackTime((prev) => {
            const newTime = Math.max(0, prev - elapsed);
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

  const handleDrop = (source: string, target: string) => {
    if (gameEnded) return false;

    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return false;

    // Add increment and switch timer
    if (game.turn() === 'b') {
      setWhiteTime((prev) => prev + INCREMENT);
    } else {
      setBlackTime((prev) => prev + INCREMENT);
    }

    lastTickRef.current = Date.now();

    setFen(game.fen());
    setLiveMoveHistory((prev) => [...prev, move.san]);
    setDrawOffered(null);
    updateStatus();
    return true;
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
    setGameResult(null);
    setShowModal(false);
    setGameEnded(false);
    setLiveMoveHistory([]);
    setDrawOffered(null);

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
    onLeaveTable?.();
  };

  // Format time display
  const formatTime = (timeInMs: number): string => {
    const totalSeconds = Math.ceil(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Lichess-style timer component
  const PlayerTimer = ({
    player,
    time,
    isActive,
  }: {
    player: 'white' | 'black';
    time: number;
    isActive: boolean;
  }) => {
    const isLowTime = time < 30000; // Less than 30 seconds
    const isCritical = time < 10000; // Less than 10 seconds
    const isVeryLow = time < 5000; // Less than 5 seconds

    return (
      <div
        className={`
        px-4 py-3 rounded-lg font-bold transition-all duration-200 w-28
        ${
          isActive
            ? isVeryLow
              ? 'bg-red-600 animate-pulse shadow-lg border-2 border-red-300'
              : isCritical
              ? 'bg-orange-600 shadow-lg border-2 border-orange-300'
              : isLowTime
              ? 'bg-yellow-600 shadow-lg border-2 border-yellow-300'
              : 'bg-blue-600 shadow-lg border-2 border-blue-300'
            : 'bg-gray-600 border-2 border-gray-500'
        }
        text-white text-center
      `}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-lg">{player === 'white' ? '⚪' : '⚫'}</span>
          <span className="text-xs font-semibold uppercase">{player}</span>
        </div>

        <div className="text-lg font-mono font-black leading-none">
          {formatTime(time)}
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="mt-1 w-full h-0.5 bg-white rounded-full"></div>
        )}
      </div>
    );
  };

  // Separate blind moves by player
  const whiteMoves = blindMoveLog.filter((move) => move.player === 'P1');
  const blackMoves = blindMoveLog.filter((move) => move.player === 'P2');
  const totalBlindMoves = blindMoveLog.length;
  const blindMoveStats: BlindMoveStats = {
    totalBlindMoves,
    whiteBlindMoves: whiteMoves.length,
    blackBlindMoves: blackMoves.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="pt-8 pb-8 px-4 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8 max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            ♟️ Live Chess Battle
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 font-medium mb-4">
            ⚡ 3+2 Blitz Format - Every second counts!
          </p>

          {/* Game Status */}
          <div className="bg-gray-800/50 rounded-lg px-6 py-3 backdrop-blur inline-block">
            <p className="text-lg font-semibold text-white">{status}</p>
          </div>
        </div>

        {/* Main Game Area - Perfect Alignment */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-center items-start gap-6">
            {/* Left Side: Chessboard */}
            <div className="flex flex-col items-center w-full lg:w-auto lg:flex-shrink-0">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-xl blur opacity-20"></div>
                <div className="relative bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-700">
                  <Chessboard
                    position={fen}
                    onPieceDrop={handleDrop}
                    boardWidth={Math.min(500, window.innerWidth - 80)}
                    boardOrientation="white"
                    customBoardStyle={{
                      borderRadius: '8px',
                      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
                    }}
                  />
                </div>
              </div>

              {/* Game Control Buttons */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {!gameEnded && (
                  <>
                    <button
                      onClick={() => setShowResignConfirm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      🏳️ Resign
                    </button>

                    {!drawOffered ? (
                      <button
                        onClick={handleOfferDraw}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        🤝 Offer Draw
                      </button>
                    ) : drawOffered !==
                      (game.turn() === 'w' ? 'white' : 'black') ? (
                      <div className="flex gap-1">
                        <button
                          onClick={handleAcceptDraw}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={handleDeclineDraw}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200"
                        >
                          ✗ Decline
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled
                        className="bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold text-sm opacity-75 cursor-not-allowed"
                      >
                        🤝 Draw Offered
                      </button>
                    )}

                    {liveMoveHistory.length < 2 && (
                      <button
                        onClick={() => setShowAbortConfirm(true)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        ❌ Abort
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Side: Perfectly Aligned Layout */}
            <div
              className="flex flex-col w-full max-w-xs"
              style={{ height: 'fit-content' }}
            >
              {/* Black Timer - Aligned with board top */}
              <div className="mb-4">
                <PlayerTimer
                  player="black"
                  time={blackTime}
                  isActive={game.turn() === 'b' && !gameEnded}
                />
              </div>

              {/* Move History Panel - Perfect spacing */}
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur rounded-xl shadow-2xl px-4 py-4 border border-gray-700/50 mb-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  <div className="bg-gray-700/50 rounded p-2 text-center">
                    <div className="text-gray-400">Total</div>
                    <div className="text-white font-bold text-lg">
                      {totalBlindMoves + liveMoveHistory.length}
                    </div>
                  </div>
                  <div className="bg-blue-900/50 rounded p-2 text-center">
                    <div className="text-blue-400">Blind</div>
                    <div className="text-blue-200 font-bold text-lg">
                      {totalBlindMoves}
                    </div>
                  </div>
                  <div className="bg-green-900/50 rounded p-2 text-center">
                    <div className="text-green-400">Live</div>
                    <div className="text-green-200 font-bold text-lg">
                      {liveMoveHistory.length}
                    </div>
                  </div>
                </div>

                {/* Move Log */}
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="grid grid-cols-3 text-gray-400 mb-2 px-1 text-xs font-semibold border-b border-gray-700 pb-2">
                    <span className="text-center">#</span>
                    <span className="text-center">⚪ White</span>
                    <span className="text-center">⚫ Black</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {(() => {
                      const moveRows = [];

                      // Add blind moves first
                      for (
                        let i = 0;
                        i < Math.max(whiteMoves.length, blackMoves.length);
                        i++
                      ) {
                        const whiteMove = whiteMoves[i];
                        const blackMove = blackMoves[i];

                        moveRows.push({
                          moveNumber: i + 1,
                          white: whiteMove,
                          black: blackMove,
                          isBlind: true,
                        });
                      }

                      // Add live moves
                      let liveStartNumber =
                        Math.max(whiteMoves.length, blackMoves.length) + 1;
                      for (let i = 0; i < liveMoveHistory.length; i += 2) {
                        const whiteMove = liveMoveHistory[i];
                        const blackMove = liveMoveHistory[i + 1];

                        moveRows.push({
                          moveNumber: liveStartNumber + Math.floor(i / 2),
                          white: whiteMove
                            ? { san: whiteMove, isInvalid: false }
                            : null,
                          black: blackMove
                            ? { san: blackMove, isInvalid: false }
                            : null,
                          isBlind: false,
                        });
                      }

                      return moveRows.map((row, index) => (
                        <div
                          key={index}
                          className={`grid grid-cols-3 rounded py-2 px-2 text-sm transition-colors duration-200 ${
                            row.isBlind
                              ? 'bg-purple-900/20 border border-purple-700/30'
                              : 'bg-gray-800/40 hover:bg-gray-700/40'
                          }`}
                        >
                          <div className="text-center font-bold text-gray-400 flex items-center justify-center">
                            {row.moveNumber}
                            {row.isBlind && (
                              <span className="text-purple-400 text-xs ml-1">
                                ●
                              </span>
                            )}
                          </div>

                          <div className="text-center">
                            {row.white ? (
                              <span
                                className={`inline-block px-2 py-1 rounded font-mono font-semibold text-xs ${
                                  row.white.isInvalid
                                    ? 'bg-red-900/60 text-red-300 border border-red-600/50 line-through'
                                    : row.isBlind
                                    ? 'bg-blue-900/60 text-blue-300 border border-blue-600/50'
                                    : 'bg-gray-700 text-gray-200 border border-gray-600'
                                }`}
                              >
                                {row.white.san}
                                {row.white.isInvalid && (
                                  <span className="ml-1 text-red-400">✗</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">—</span>
                            )}
                          </div>

                          <div className="text-center">
                            {row.black ? (
                              <span
                                className={`inline-block px-2 py-1 rounded font-mono font-semibold text-xs ${
                                  row.black.isInvalid
                                    ? 'bg-red-900/60 text-red-300 border border-red-600/50 line-through'
                                    : row.isBlind
                                    ? 'bg-gray-800/60 text-gray-300 border border-gray-600/50'
                                    : 'bg-gray-700 text-gray-200 border border-gray-600'
                                }`}
                              >
                                {row.black.san}
                                {row.black.isInvalid && (
                                  <span className="ml-1 text-red-400">✗</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">—</span>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-3 flex justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-purple-400">●</span>
                    <span className="text-gray-300">Blind</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-red-400">✗</span>
                    <span className="text-gray-300">Invalid</span>
                  </div>
                </div>
              </div>

              {/* White Timer - Aligned with board bottom */}
              <PlayerTimer
                player="white"
                time={whiteTime}
                isActive={game.turn() === 'w' && !gameEnded}
              />
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center text-gray-400 max-w-2xl mx-auto mt-8">
          <p className="text-sm">
            ⚡ <strong>Blitz Format:</strong> 3 minutes + 2 second increment per
            move
          </p>
          <p className="text-xs mt-2">
            Time pressure makes every decision count! Good luck! 🔥
          </p>
        </div>

        {/* Epic Game End Modal */}
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
        {showResignConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
              <div className="text-center">
                <div className="text-4xl mb-4">🏳️</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Resign Game?
                </h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to resign? This will end the game
                  immediately.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowResignConfirm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResign}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                  >
                    Yes, Resign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAbortConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
              <div className="text-center">
                <div className="text-4xl mb-4">❌</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Abort Game?
                </h3>
                <p className="text-gray-300 mb-6">
                  This will cancel the current game and return to the main menu.
                  No result will be recorded.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowAbortConfirm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAbortGame}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                  >
                    Yes, Abort
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveBoard;
