import React from 'react';

interface MoveHistoryRowProps {
  turnNumber: number;
  whiteMove?: string;
  blackMove?: string;
  whiteInvalid?: boolean;
  blackInvalid?: boolean;
  isBlind?: boolean;
}

const MoveHistoryRow: React.FC<MoveHistoryRowProps> = ({
  turnNumber,
  whiteMove,
  blackMove,
  whiteInvalid = false,
  blackInvalid = false,
  isBlind = false,
}) => {
  const getMoveStyle = (isInvalid: boolean, isBlind: boolean) => {
    if (isInvalid) {
      return 'text-red-400 line-through font-semibold';
    }
    if (isBlind) {
      return 'text-amber-500 italic font-semibold';
    }
    return 'text-white font-semibold';
  };

  const blindBg = isBlind
    ? 'bg-amber-100/20 backdrop-blur-sm border border-amber-300/30'
    : '';

  return (
    <div
      className={`flex items-center gap-2 py-1 px-3 rounded-lg transition-colors ${blindBg} ${
        isBlind ? 'hover:bg-amber-200/20' : 'hover:bg-white/5'
      }`}
    >
      {/* Turn number */}
      <span className="text-xs text-gray-400 font-mono min-w-[20px]">
        {turnNumber}.
      </span>

      {/* White move */}
      <div className="flex-1 flex items-center gap-1">
        <span className="text-xs text-gray-300">⚪</span>
        {isBlind && <span className="text-amber-400 text-sm">🕶️</span>}
        <span
          className={`text-sm ${getMoveStyle(
            whiteInvalid,
            isBlind
          )} transition-transform`}
        >
          {whiteMove || '...'}
        </span>
      </div>

      {/* Black move */}
      <div className="flex-1 flex items-center gap-1">
        <span className="text-xs text-gray-300">⚫</span>
        {isBlind && <span className="text-amber-400 text-sm">🕶️</span>}
        <span
          className={`text-sm ${getMoveStyle(
            blackInvalid,
            isBlind
          )} transition-transform`}
        >
          {blackMove || '...'}
        </span>
      </div>
    </div>
  );
};

export default MoveHistoryRow;
