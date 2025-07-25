import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import type { SquareIndicator } from '../services/chess';

interface Props {
  game: Chess;
  isWhite: boolean;
  squareStyles: { [square: string]: any };
  pieceIndicators: { [square: string]: SquareIndicator };
  onDrop: (from: string, to: string, piece: string) => boolean;
}

const ChessBoardWrapper = ({
  game,
  isWhite,
  squareStyles,
  pieceIndicators,
  onDrop,
}: Props) => {
  return (
    <div className="relative">
      <Chessboard
        boardOrientation={isWhite ? 'white' : 'black'}
        position={game.fen()}
        onPieceDrop={onDrop}
        boardWidth={480}
        customSquareStyles={squareStyles}
      />

      <div className="absolute inset-0 pointer-events-none">
        {Object.entries(pieceIndicators).map(([square, indicator]) => {
          const file = square.charCodeAt(0) - 97;
          const rank = parseInt(square[1]) - 1;
          const x = isWhite ? file * 60 : (7 - file) * 60;
          const y = isWhite ? (7 - rank) * 60 : rank * 60;

          return (
            <div
              key={square}
              className={`absolute text-white text-xs font-bold rounded-full px-2 py-1 shadow-lg ${
                indicator.status === 'exhausted'
                  ? 'bg-red-600'
                  : indicator.status === 'warning'
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }`}
              style={{
                left: `${x + 35}px`,
                top: `${y + 5}px`,
                fontSize: '10px',
                minWidth: '20px',
                textAlign: 'center',
              }}
            >
              {indicator.moveCount}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChessBoardWrapper;
