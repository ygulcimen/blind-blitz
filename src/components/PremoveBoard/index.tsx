import ChessBoardWrapper from '../ChessBoardWrapper';
import MoveLogPanel from './MoveLogPanel';
import LegendPanel from './LegendPanel';
import ActionButtons from './ActionButtons';
import type { Chess } from 'chess.js';
import type { BlindSequence } from '../../types/BlindTypes';
import type { SquareIndicator } from '../../services/chess';

interface Props {
  game: Chess;
  isWhite: boolean;
  squareStyles: { [square: string]: any };
  pieceIndicators: { [square: string]: SquareIndicator };
  moves: BlindSequence;
  maxMoves: number;
  moveSummary: {
    totalMoves: number;
    totalPiecesMoved: number;
    exhaustedPieces: number;
  };
  onDrop: (from: string, to: string, piece: string) => boolean;
  onUndo: () => void;
  onReset: () => void;
  onSubmit: (moves: BlindSequence) => void;
}

const PremoveBoard = ({
  game,
  isWhite,
  squareStyles,
  pieceIndicators,
  moves,
  maxMoves,
  moveSummary,
  onDrop,
  onUndo,
  onReset,
  onSubmit,
}: Props) => {
  const remainingMoves = maxMoves - moveSummary.totalMoves;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Container with proper spacing to avoid timer overlap */}
      <div className="pt-20 pb-8 px-4 lg:px-8">
        {/* Enhanced header with responsive design */}
        <div className="text-center mb-6 lg:mb-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${
                isWhite ? 'bg-white' : 'bg-gray-800 border-2 border-white'
              }`}
            ></div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {isWhite ? 'White' : 'Black'} Blind Attack
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 lg:gap-6 text-xs lg:text-sm bg-gray-800/50 rounded-lg px-4 lg:px-6 py-3 backdrop-blur max-w-2xl mx-auto">
            <span className="text-gray-300 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
              <span className="whitespace-nowrap">Max 2 moves per piece</span>
            </span>
            <span
              className={`font-bold flex items-center justify-center gap-2 ${
                remainingMoves === 0
                  ? 'text-red-400'
                  : remainingMoves <= 1
                  ? 'text-yellow-400'
                  : 'text-green-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  remainingMoves === 0
                    ? 'bg-red-400'
                    : remainingMoves <= 1
                    ? 'bg-yellow-400'
                    : 'bg-green-400'
                }`}
              ></span>
              <span className="whitespace-nowrap">
                {moveSummary.totalMoves}/{maxMoves} moves • {remainingMoves}{' '}
                remaining
              </span>
            </span>
          </div>
        </div>

        {/* Optimized main content layout */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-center items-start lg:items-center gap-6 lg:gap-8">
            {/* Left side - Board and controls with tighter spacing */}
            <div className="flex flex-col items-center w-full lg:w-auto lg:flex-shrink-0">
              {/* Board container */}
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
                <ChessBoardWrapper
                  game={game}
                  isWhite={isWhite}
                  squareStyles={squareStyles}
                  pieceIndicators={pieceIndicators}
                  onDrop={onDrop}
                />
              </div>

              {/* Action buttons - moved closer to board */}
              <div className="mt-3 lg:mt-4 w-full flex justify-center">
                <ActionButtons
                  moves={moves}
                  onUndo={onUndo}
                  onReset={onReset}
                  onSubmit={onSubmit}
                  maxMoves={maxMoves}
                />
              </div>

              {/* Legend - moved below buttons for better flow */}
              <div className="mt-4 lg:mt-5 w-full max-w-2xl">
                <LegendPanel />
              </div>
            </div>

            {/* Right side - Move log panel */}
            <div className="w-full lg:w-auto lg:flex-shrink-0 flex justify-center lg:justify-start">
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-xs xl:max-w-sm">
                <MoveLogPanel
                  moves={moves}
                  maxMoves={maxMoves}
                  moveSummary={moveSummary}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremoveBoard;
