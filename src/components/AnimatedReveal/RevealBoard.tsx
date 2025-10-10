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
  // Calculate responsive board width - Same as BlindPhaseBoard
  const getBoardWidth = () => {
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    if (isMobile) {
      // On mobile: use most of the screen width and account for bottom panel
      return Math.min(
        window.innerWidth * 0.92,
        (window.innerHeight - 160) * 0.85 // 160px for bottom panel + padding (smaller than BlindPhase)
      );
    }
    // On desktop: original calculation
    return Math.min(
      700,
      window.innerWidth * 0.5,
      window.innerHeight * 0.85
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-8 relative pb-24 lg:pb-8">
      {/* Board glow effect - Responsive */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[700px] bg-gradient-to-r ${
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
          boardWidth={getBoardWidth()}
        />
      </div>

      {/* Move effect overlay */}
      {showMoveEffect && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div
              className={`w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-r ${modeInfo.progressGradient} opacity-30 rounded-full animate-ping`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
