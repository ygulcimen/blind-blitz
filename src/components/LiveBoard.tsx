import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
}

interface Props {
  startingFen: string;
  blindMoveLog?: MoveLogItem[]; // The blind phase history
}

const LiveBoard = ({ startingFen, blindMoveLog = [] }: Props) => {
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

  useEffect(() => {
    updateStatus();
  }, [game]);

  const handleDrop = (source: string, target: string) => {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return false;

    setFen(game.fen());
    setLiveMoveHistory((prev) => [...prev, move.san]);
    updateStatus();
    return true;
  };

  const updateStatus = () => {
    if (game.isCheckmate()) {
      setStatus(
        `🏆 Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`
      );
    } else if (game.isDraw()) {
      setStatus('🤝 Draw! Game ends in a tie');
    } else if (game.inCheck()) {
      setStatus(`⚠️ ${game.turn() === 'w' ? 'White' : 'Black'} is in check!`);
    } else {
      setStatus(`${game.turn() === 'w' ? '⚪ White' : '⚫ Black'} to move`);
    }
  };

  // Separate blind moves by player
  const whiteMoves = blindMoveLog.filter((move) => move.player === 'P1');
  const blackMoves = blindMoveLog.filter((move) => move.player === 'P2');

  // Stats calculation
  const totalBlindMoves = blindMoveLog.length;
  const validBlindMoves = blindMoveLog.filter((m) => !m.isInvalid).length;
  const invalidBlindMoves = totalBlindMoves - validBlindMoves;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="pt-8 pb-8 px-4 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8 max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            ♟️ Live Chess Battle
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 font-medium mb-4">
            The blind chaos has settled. White starts the live phase!
          </p>

          {/* Game Status */}
          <div className="bg-gray-800/50 rounded-lg px-6 py-3 backdrop-blur inline-block">
            <p className="text-lg font-semibold text-white">{status}</p>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-center items-start lg:items-center gap-8">
            {/* Chessboard */}
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

              {/* Live Move Counter */}
              <div className="mt-4 bg-gray-800/50 rounded-lg px-4 py-2 backdrop-blur">
                <p className="text-sm text-gray-300 text-center">
                  Live Moves:{' '}
                  <span className="text-blue-400 font-bold">
                    {liveMoveHistory.length}
                  </span>
                </p>
              </div>
            </div>

            {/* Enhanced Move History Panel - Lichess Style */}
            <div className="w-full lg:w-auto lg:flex-shrink-0 flex justify-center lg:justify-start">
              <div
                className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur 
                              rounded-xl shadow-2xl w-full max-w-md px-6 py-5 border border-gray-700/50"
              >
                <h3 className="text-center font-bold mb-4 text-xl bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  📋 Complete Game Log
                </h3>

                {/* Game Statistics Summary */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                    <div className="text-gray-400">Total</div>
                    <div className="text-white font-bold">
                      {totalBlindMoves + liveMoveHistory.length}
                    </div>
                  </div>
                  <div className="bg-blue-900/50 rounded-lg p-2 text-center">
                    <div className="text-blue-400">Blind</div>
                    <div className="text-blue-200 font-bold">
                      {totalBlindMoves}
                    </div>
                  </div>
                  <div className="bg-green-900/50 rounded-lg p-2 text-center">
                    <div className="text-green-400">Live</div>
                    <div className="text-green-200 font-bold">
                      {liveMoveHistory.length}
                    </div>
                  </div>
                </div>

                {/* Lichess-style Move Log */}
                <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 text-gray-400 mb-3 px-1 text-xs font-semibold border-b border-gray-700 pb-2">
                    <span className="text-center">#</span>
                    <span className="text-center">⚪ White</span>
                    <span className="text-center">⚫ Black</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {(() => {
                      // Create move pairs for Lichess-style display
                      const moveRows = [];
                      const maxMoves = Math.max(
                        whiteMoves.length,
                        blackMoves.length,
                        Math.ceil(liveMoveHistory.length / 2)
                      );

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
                          className={`grid grid-cols-3 rounded-lg py-2 px-2 text-sm transition-colors duration-200 ${
                            row.isBlind
                              ? 'bg-purple-900/20 border border-purple-700/30'
                              : 'bg-gray-800/40 hover:bg-gray-700/40'
                          }`}
                        >
                          {/* Move Number */}
                          <div className="text-center font-bold text-gray-400 flex items-center justify-center">
                            {row.moveNumber}
                            {row.isBlind && (
                              <span className="text-purple-400 text-xs ml-1">
                                ●
                              </span>
                            )}
                          </div>

                          {/* White Move */}
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

                          {/* Black Move */}
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
                <div className="text-xs space-y-2">
                  <div className="text-center text-gray-400 font-semibold mb-3">
                    📖 Move Legend
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400">●</span>
                      <span className="text-gray-300">Blind phase</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">✗</span>
                      <span className="text-gray-300">Invalid move</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-900/60 border border-blue-600/50 rounded"></div>
                      <span className="text-gray-300">White blind</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-800/60 border border-gray-600/50 rounded"></div>
                      <span className="text-gray-300">Black blind</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center text-gray-400 max-w-2xl mx-auto mt-8">
          <p className="text-sm">
            🎉 <strong>The blind chaos has been resolved!</strong> White always
            starts the live phase.
          </p>
          <p className="text-xs mt-2">
            The position above shows the result of all valid blind moves • White
            moves first to continue!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveBoard;
