// components/WaitingRoom/ArenaHeader.tsx - Shows Arena Tier & Mode
import React from 'react';
import {
  Shield,
  Swords,
  Star,
  Crown,
  Gem,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ArenaHeaderProps {
  tier: 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
  mode: 'classic' | 'robochaos';
  entryFee: number;
}

const TIER_CONFIG = {
  pawn: {
    label: 'PAWN ARENA',
    Icon: Shield,
    description: 'Beginner Territory',
    colors: {
      primary: 'emerald',
      gradient: 'from-emerald-600 via-emerald-500 to-green-500',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.5)]',
      text: 'text-emerald-300',
      border: 'border-emerald-500/50',
    },
  },
  knight: {
    label: 'KNIGHT ARENA',
    Icon: Swords,
    description: "Warrior's Domain",
    colors: {
      primary: 'blue',
      gradient: 'from-blue-600 via-blue-500 to-cyan-500',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.5)]',
      text: 'text-blue-300',
      border: 'border-blue-500/50',
    },
  },
  bishop: {
    label: 'BISHOP ARENA',
    Icon: Star,
    description: 'Strategic Grounds',
    colors: {
      primary: 'purple',
      gradient: 'from-purple-600 via-purple-500 to-indigo-500',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.5)]',
      text: 'text-purple-300',
      border: 'border-purple-500/50',
    },
  },
  rook: {
    label: 'ROOK ARENA',
    Icon: Swords,
    description: 'Fortress of Champions',
    colors: {
      primary: 'orange',
      gradient: 'from-orange-600 via-orange-500 to-amber-500',
      glow: 'shadow-[0_0_30px_rgba(249,115,22,0.5)]',
      text: 'text-orange-300',
      border: 'border-orange-500/50',
    },
  },
  queen: {
    label: 'QUEEN ARENA',
    Icon: Crown,
    description: 'Elite Battleground',
    colors: {
      primary: 'pink',
      gradient: 'from-pink-600 via-pink-500 to-rose-500',
      glow: 'shadow-[0_0_30px_rgba(236,72,153,0.6)]',
      text: 'text-pink-300',
      border: 'border-pink-500/50',
    },
  },
  king: {
    label: 'KING ARENA',
    Icon: Gem,
    description: 'Supreme Championship',
    colors: {
      primary: 'yellow',
      gradient: 'from-yellow-500 via-amber-400 to-orange-400',
      glow: 'shadow-[0_0_40px_rgba(234,179,8,0.7)]',
      text: 'text-yellow-300',
      border: 'border-yellow-500/50',
    },
  },
} as const;

export const ArenaHeader: React.FC<ArenaHeaderProps> = ({ tier, mode, entryFee }) => {
  const config = TIER_CONFIG[tier];
  const { Icon, label, description, colors } = config;
  const isRoboChaos = mode === 'robochaos';

  return (
    <div className="mb-6 sm:mb-8">
      {/* Arena Tier Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl border-2 ${
          isRoboChaos ? 'border-pink-500/50' : colors.border
        } ${isRoboChaos ? 'shadow-[0_0_40px_rgba(236,72,153,0.6)]' : colors.glow} backdrop-blur-sm`}
      >
        {/* Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${
            isRoboChaos
              ? 'from-purple-900/40 via-pink-900/40 to-red-900/40'
              : colors.gradient
          } opacity-20`}
        />

        {/* Animated particles for RoboChaos */}
        {isRoboChaos && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-pink-400 rounded-full"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: '100%',
                  opacity: 0,
                }}
                animate={{
                  y: '-10%',
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Left: Arena Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Icon */}
              <motion.div
                animate={isRoboChaos ? {
                  rotate: [0, -5, 5, -5, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                } : { scale: [1, 1.05, 1] }}
                transition={{
                  duration: isRoboChaos ? 2 : 3,
                  repeat: Infinity,
                }}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center ${
                  isRoboChaos
                    ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-pink-400/50 shadow-[0_0_20px_rgba(236,72,153,0.6)]'
                    : `bg-gradient-to-br ${colors.gradient} bg-opacity-30 border-2 ${colors.border}`
                }`}
              >
                <Icon
                  className={`w-6 h-6 sm:w-8 sm:h-8 ${
                    isRoboChaos ? 'text-pink-300' : colors.text
                  } drop-shadow-lg`}
                />
              </motion.div>

              {/* Arena Name */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2
                    className={`text-lg sm:text-2xl font-black tracking-wider ${
                      isRoboChaos
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-red-300'
                        : colors.text
                    }`}
                  >
                    {label}
                  </h2>
                  {isRoboChaos && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <Zap className="w-5 h-5 text-pink-400" />
                    </motion.div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">
                  {description}
                </p>
              </div>
            </div>

            {/* Right: Entry Fee */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-xl border-2 ${
                isRoboChaos
                  ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-pink-500/50'
                  : `bg-black/30 ${colors.border}`
              } flex items-center gap-2`}
            >
              <Sparkles className={`w-4 h-4 ${isRoboChaos ? 'text-pink-400' : colors.text}`} />
              <span className={`text-sm sm:text-base font-bold ${isRoboChaos ? 'text-pink-300' : colors.text}`}>
                {entryFee} 🪙
              </span>
            </motion.div>
          </div>

          {/* Mode Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 inline-flex"
          >
            <div
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold ${
                isRoboChaos
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] border border-pink-400/30'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-400/30'
              }`}
            >
              {isRoboChaos ? (
                <span className="flex items-center gap-1.5">
                  🤖 ROBOCHAOS MODE
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⚡
                  </motion.span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  👁️‍🗨️ CLASSIC BLIND
                  <span>♟️</span>
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
