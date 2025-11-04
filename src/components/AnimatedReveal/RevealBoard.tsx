// components/AnimatedReveal/components/RevealBoard.tsx
import React from 'react';
import UnifiedChessBoard from '../shared/ChessBoard/UnifiedChessBoard';
import { motion, AnimatePresence } from 'framer-motion';

interface RevealBoardProps {
  displayFen: string;
  myColor: 'white' | 'black' | null;
  showMoveEffect: boolean;
  modeInfo: {
    bgGradient: string;
    progressGradient: string;
  };
  currentMove?: {
    isInvalid: boolean;
    isCapture?: boolean;
  } | null;
}

export const RevealBoard: React.FC<RevealBoardProps> = ({
  displayFen,
  myColor,
  showMoveEffect,
  modeInfo,
  currentMove,
}) => {
  // Determine effect type
  const isInvalidMove = currentMove?.isInvalid;
  const isCaptureMove = currentMove?.isCapture && !isInvalidMove;
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
      {/* Board glow effect - Enhanced with move type detection */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[700px] bg-gradient-to-r ${
            showMoveEffect
              ? isInvalidMove
                ? 'from-red-500/30 via-red-600/20 to-red-500/30' // Red for invalid
                : isCaptureMove
                ? 'from-yellow-500/30 via-orange-500/20 to-yellow-500/30' // Gold for capture
                : modeInfo.bgGradient // Normal
              : 'from-blue-500/10 via-purple-500/10 to-cyan-500/10'
          } rounded-3xl blur-3xl ${showMoveEffect ? 'animate-pulse' : ''}`}
        />
      </div>

      {/* Board shake animation for invalid moves */}
      <motion.div
        className="relative z-10"
        animate={showMoveEffect && isInvalidMove ? {
          x: [0, -10, 10, -10, 10, 0],
          rotate: [0, -2, 2, -2, 2, 0]
        } : {}}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <UnifiedChessBoard
          fen={displayFen}
          isFlipped={myColor === 'black'}
          phase="reveal"
          showMoveEffect={showMoveEffect}
          animationDuration={1000}
          gameEnded={false}
          boardWidth={getBoardWidth()}
        />
      </motion.div>

      {/* Invalid Move Effect - Red Flash */}
      <AnimatePresence>
        {showMoveEffect && isInvalidMove && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.4, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-red-600/40 mix-blend-overlay" />
            {/* X Icons */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1.5, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 0.5 }}
                className="text-red-500 text-6xl sm:text-8xl font-black drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
              >
                ✗
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture Effect - Gold Explosion */}
      <AnimatePresence>
        {showMoveEffect && isCaptureMove && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Explosion particles */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * 360) / 8;
              const distance = 100;
              const x = Math.cos((angle * Math.PI) / 180) * distance;
              const y = Math.sin((angle * Math.PI) / 180) * distance;

              return (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x,
                    y,
                    scale: 0,
                    opacity: 0
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-sm" />
                </motion.div>
              );
            })}
            {/* Center burst */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 2, 3], opacity: [1, 0.5, 0] }}
                transition={{ duration: 0.6 }}
                className="w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-40 rounded-full"
              />
            </div>
            {/* Sparkle effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "linear" }}
                className="text-yellow-400 text-5xl sm:text-7xl drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]"
              >
                ✨
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Normal Move effect overlay */}
      {showMoveEffect && !isInvalidMove && !isCaptureMove && (
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
