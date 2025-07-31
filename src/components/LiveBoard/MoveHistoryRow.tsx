import React, { useState, useEffect } from 'react';

interface MoveHistoryRowProps {
  turnNumber: number;
  whiteMove?: string;
  blackMove?: string;
  whiteInvalid?: boolean;
  blackInvalid?: boolean;
  isBlind?: boolean;
  isLastMove?: boolean; // Special prop to indicate this is the very last move
}

const MoveHistoryRow: React.FC<MoveHistoryRowProps> = ({
  turnNumber,
  whiteMove,
  blackMove,
  whiteInvalid = false,
  blackInvalid = false,
  isBlind = false,
  isLastMove = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showLastMoveGlow, setShowLastMoveGlow] = useState(false);

  // Trigger glow effect when this becomes the last move
  useEffect(() => {
    if (isLastMove) {
      setShowLastMoveGlow(true);
      // Auto-fade the glow after 3 seconds
      const timer = setTimeout(() => {
        setShowLastMoveGlow(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLastMove]);

  const getMoveStyle = (
    isInvalid: boolean,
    isBlind: boolean,
    isLastMove: boolean
  ) => {
    if (isInvalid) {
      return 'text-red-400 line-through font-semibold';
    }
    if (isBlind) {
      return 'text-amber-500 italic font-semibold';
    }
    if (isLastMove) {
      return 'text-blue-300 font-bold text-base'; // Larger and brighter for last move
    }
    return 'text-white font-semibold';
  };

  const getRowBackground = () => {
    if (isLastMove) {
      return `
        bg-gradient-to-r from-blue-900/60 to-blue-800/60 
        border-2 border-blue-500/60 shadow-xl
        ${showLastMoveGlow ? 'shadow-blue-500/50' : ''}
      `;
    }
    if (isBlind) {
      return 'bg-amber-100/20 backdrop-blur-sm border border-amber-300/30';
    }
    return '';
  };

  const getHoverEffect = () => {
    if (isLastMove) {
      return 'hover:shadow-2xl hover:shadow-blue-500/40 hover:border-blue-400/80';
    }
    if (isBlind) {
      return 'hover:bg-amber-200/20';
    }
    return 'hover:bg-white/5';
  };

  return (
    <div
      className={`
        flex items-center gap-2 py-1 px-3 rounded-lg transition-all duration-500 cursor-pointer
        ${getRowBackground()} ${getHoverEffect()}
        ${isLastMove ? 'animate-pulse scale-[1.05] mb-2' : ''}
        ${showLastMoveGlow ? 'animate-bounce' : ''}
        ${isHovered ? 'transform scale-[1.02] shadow-lg' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Turn number with special styling for last move */}
      <span
        className={`
        text-xs font-mono min-w-[20px] font-bold px-2 py-1 rounded-md
        ${
          isLastMove
            ? 'bg-blue-500/40 text-blue-200 border-2 border-blue-400/60 text-sm'
            : isBlind
            ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
            : 'text-gray-400'
        }
      `}
      >
        {turnNumber}.
      </span>

      {/* White move */}
      <div className="flex-1 flex items-center gap-1">
        <span className="text-xs text-gray-300">⚪</span>
        {isBlind && <span className="text-amber-400 text-sm">🕶️</span>}
        {isLastMove && (
          <span className="text-blue-400 text-sm animate-pulse">⚡</span>
        )}
        <span
          className={`
            text-sm transition-transform
            ${getMoveStyle(whiteInvalid, isBlind, isLastMove)}
            ${isHovered ? 'transform scale-105' : ''}
          `}
        >
          {whiteMove || '...'}
        </span>
      </div>

      {/* Black move */}
      <div className="flex-1 flex items-center gap-1">
        <span className="text-xs text-gray-300">⚫</span>
        {isBlind && <span className="text-amber-400 text-sm">🕶️</span>}
        {isLastMove && (
          <span className="text-blue-400 text-sm animate-pulse">⚡</span>
        )}
        <span
          className={`
            text-sm transition-transform
            ${getMoveStyle(blackInvalid, isBlind, isLastMove)}
            ${isHovered ? 'transform scale-105' : ''}
          `}
        >
          {blackMove || '...'}
        </span>
      </div>

      {/* Enhanced status indicators for last move */}
      <div className="flex items-center gap-1 min-w-[24px]">
        {isLastMove && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg"></div>
            <span className="text-blue-400 text-xs font-bold">NEW</span>
          </div>
        )}
        {isBlind && !isLastMove && (
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg"></div>
        )}
        {whiteInvalid && <span className="text-red-400 text-xs">❌</span>}
        {blackInvalid && <span className="text-red-400 text-xs">❌</span>}
      </div>
    </div>
  );
};

export default MoveHistoryRow;
