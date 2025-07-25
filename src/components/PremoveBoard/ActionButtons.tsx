import type { BlindSequence } from '../../types/BlindTypes';

interface Props {
  moves: BlindSequence;
  onUndo: () => void;
  onReset: () => void;
  onSubmit: (moves: BlindSequence) => void;
  maxMoves: number;
}

const ActionButtons = ({
  moves,
  onUndo,
  onReset,
  onSubmit,
  maxMoves,
}: Props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 mt-3 lg:mt-4 w-full max-w-lg">
      <button
        onClick={onUndo}
        disabled={!moves.length}
        className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 
                   px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-white font-medium shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-all duration-200 transform hover:scale-105 active:scale-95
                   flex items-center justify-center gap-2 text-sm lg:text-base"
      >
        <span className="text-sm lg:text-base">↶</span>
        <span className="hidden sm:inline">Undo Last</span>
        <span className="sm:hidden">Undo</span>
      </button>

      <button
        onClick={onReset}
        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 
                   px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-white font-medium shadow-lg
                   transition-all duration-200 transform hover:scale-105 active:scale-95
                   flex items-center justify-center gap-2 text-sm lg:text-base"
      >
        <span className="text-sm lg:text-base">🔄</span>
        <span className="hidden sm:inline">Reset All</span>
        <span className="sm:hidden">Reset</span>
      </button>

      <button
        onClick={() => onSubmit(moves)}
        disabled={moves.length === 0}
        className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg text-white font-bold shadow-lg
                   transition-all duration-200 transform hover:scale-105 active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                   text-sm lg:text-base flex-1 sm:flex-none
                   ${
                     moves.length === maxMoves
                       ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 animate-pulse'
                       : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
                   }`}
      >
        {moves.length === maxMoves ? (
          <>
            <span className="text-sm lg:text-base">🚀</span>
            <span className="hidden sm:inline">Launch Attack!</span>
            <span className="sm:hidden">Launch!</span>
          </>
        ) : (
          <>
            <span className="text-sm lg:text-base">⚡</span>
            <span>
              Submit ({moves.length}/{maxMoves})
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default ActionButtons;
