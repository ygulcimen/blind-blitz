// components/AnimatedReveal/components/RevealBoard.tsx
import React from 'react';
import UnifiedChessBoard from '../shared/ChessBoard/UnifiedChessBoard';

interface RevealBoardProps {
  displayFen: string;
  myColor: 'white' | 'black' | null;
  showMoveEffect: boolean;
  modeInfo: {
    bgGradient: string;
    progressGradient: string;
  };
}

export const RevealBoard: React.FC<RevealBoardProps> = ({
  displayFen,
  myColor,
  showMoveEffect,
  modeInfo,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8 relative">
      {/* Board glow effect - Same as BlindPhase */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[700px] h-[700px] bg-gradient-to-r ${
            showMoveEffect
              ? modeInfo.bgGradient
              : 'from-blue-500/10 via-purple-500/10 to-cyan-500/10'
          } rounded-3xl blur-3xl ${showMoveEffect ? 'animate-pulse' : ''}`}
        />
      </div>

      <div className="relative z-10">
        <UnifiedChessBoard
          fen={displayFen}
          isFlipped={myColor === 'black'}
          phase="reveal"
          showMoveEffect={showMoveEffect}
          animationDuration={1000}
          gameEnded={false}
          boardWidth={Math.min(
            700,
            window.innerWidth * 0.5,
            window.innerHeight * 0.85
          )}
        />
      </div>

      {/* Move effect overlay */}
      {showMoveEffect && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div
              className={`w-32 h-32 bg-gradient-to-r ${modeInfo.progressGradient} opacity-30 rounded-full animate-ping`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
