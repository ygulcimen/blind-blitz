// src/components/TestBoard.tsx
import { useState } from 'react';
import { Chess, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const TestBoard = () => {
  const [game, setGame] = useState(new Chess());

  // — handle a drop and return TRUE if it was legal —
  const handlePieceDrop = (
    sourceSquare: string,
    targetSquare: string,
    _piece: string // we can ignore the piece param for now
  ): boolean => {
    const newGame = new Chess(game.fen());

    // Try the move (add promotion field to avoid null on pawn-to-back-rank)
    const move: Move | null = newGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for test purposes
    });

    if (move === null) return false; // illegal → signal reject

    setGame(newGame); // legal → update board
    return true;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Test Board</h2>
      <Chessboard
        position={game.fen()}
        onPieceDrop={handlePieceDrop}
        boardWidth={480}
      />
    </div>
  );
};

export default TestBoard;
