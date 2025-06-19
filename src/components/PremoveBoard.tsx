import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { BlindSequence } from '../types/BlindTypes';

interface Props {
  player: 'P1' | 'P2';
  onSubmit: (moves: BlindSequence) => void;
  onReset: () => void;
}

const PremoveBoard = ({ player, onSubmit, onReset }: Props) => {
  const isWhite = player === 'P1';
  const colourLetter = isWhite ? 'w' : 'b';

  // ── single live Chess instance ────────────────────────────
  const [game, setGame] = useState(() => {
    const g = new Chess();
    g.setTurn(colourLetter);
    return g;
  });

  const [queuedMoves, setQueuedMoves] = useState<BlindSequence>([]);

  // ── arrows derived from queued moves ──────────────────────

  // ── handle a drag-and-drop premove ────────────────────────
  const handleDrop = (from: string, to: string, piece: string): boolean => {
    if (queuedMoves.length >= 5) return false;
    if ((isWhite && piece[0] !== 'w') || (!isWhite && piece[0] !== 'b'))
      return false;

    const next = new Chess(game.fen());
    const mv = next.move({ from, to, promotion: 'q' });
    if (!mv) return false; // illegal path

    // lock turn back to same player
    next.setTurn(colourLetter);

    setQueuedMoves([...queuedMoves, { from, to, san: mv.san }]);
    setGame(next);
    return true;
  };

  // ── undo last premove ─────────────────────────────────────
  const handleUndo = () => {
    if (!queuedMoves.length) return;

    const newQueue = queuedMoves.slice(0, -1);
    const g = new Chess();
    g.setTurn(colourLetter);

    newQueue.forEach((m) => {
      g.move({ ...m, promotion: 'q' });
      g.setTurn(colourLetter);
    });

    setQueuedMoves(newQueue);
    setGame(g);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* header */}
      <h2 className="text-xl font-bold text-center mb-2">
        {player}: make your five blind moves
      </h2>

      {/* board + move list */}
      <div className="flex gap-6">
        {/* ─────── Chessboard ─────── */}
        <Chessboard
          boardOrientation={isWhite ? 'white' : 'black'}
          position={game.fen()}
          onPieceDrop={handleDrop}
          boardWidth={480}
        />

        {/* ─────── Move log styled card ─────── */}
        <div className="bg-gray-800 text-gray-100 rounded shadow-lg w-64 px-4 py-3 text-sm font-mono h-fit">
          <h3 className="text-center font-semibold mb-2">Queued</h3>

          {/* Header row */}
          <div className="grid grid-cols-3 text-gray-400 mb-1 px-1">
            <span>#</span>
            <span>Move</span>
            <span></span>
          </div>

          {/* Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-3 border-t border-gray-700 py-1 px-1"
            >
              <span className="text-gray-400">{i + 1}</span>
              <span>{queuedMoves[i]?.san ?? ''}</span>
              <span></span>
            </div>
          ))}
        </div>
      </div>

      {/* controls */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleUndo}
          disabled={!queuedMoves.length}
          className="bg-yellow-500 px-3 py-1 rounded text-black disabled:opacity-50"
        >
          Undo
        </button>
        <button
          onClick={onReset}
          className="bg-red-600 px-3 py-1 rounded text-white"
        >
          Reset
        </button>
        <button
          onClick={() => onSubmit(queuedMoves)}
          disabled={queuedMoves.length < 5}
          className="bg-green-600 px-3 py-1 rounded text-white disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default PremoveBoard;
