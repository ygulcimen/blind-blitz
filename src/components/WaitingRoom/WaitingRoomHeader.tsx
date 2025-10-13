// components/WaitingRoom/WaitingRoomHeader.tsx
import React from 'react';
import { ArrowLeft, Shield, Swords, Star, Crown, Gem, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoomData {
  id: string;
  name: string;
  mode: 'classic' | 'robochaos';
  entry_fee: number;
  host_id: string;
  host_username: string;
  current_players: number;
  max_players: number;
  status: string;
}

interface WaitingRoomHeaderProps {
  roomData: RoomData;
  onLeave: () => void;
}

// Tier detection based on entry fee ranges
export const getTierFromEntryFee = (entryFee: number) => {
  if (entryFee >= 10 && entryFee <= 24) return 'pawn';
  if (entryFee >= 25 && entryFee <= 49) return 'knight';
  if (entryFee >= 50 && entryFee <= 99) return 'bishop';
  if (entryFee >= 100 && entryFee <= 249) return 'rook';
  if (entryFee >= 250 && entryFee <= 499) return 'queen';
  if (entryFee >= 500) return 'king';
  return 'pawn';
};

export const TIER_CONFIG = {
  pawn: {
    label: 'PAWN ARENA',
    Icon: Shield,
    gradient: 'from-emerald-600 via-emerald-500 to-green-500',
    headerBg: 'from-emerald-900/40 via-emerald-800/30 to-black/40',
    bgGradient: 'from-emerald-900/20 via-black to-green-900/20',
    orb1: 'from-emerald-500/15 to-green-500/15',
    orb2: 'from-green-500/15 to-emerald-500/15',
    iconClass: 'text-emerald-400',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/30',
  },
  knight: {
    label: 'KNIGHT ARENA',
    Icon: Swords,
    gradient: 'from-blue-600 via-blue-500 to-cyan-500',
    headerBg: 'from-blue-900/40 via-blue-800/30 to-black/40',
    bgGradient: 'from-blue-900/20 via-black to-cyan-900/20',
    orb1: 'from-blue-500/15 to-cyan-500/15',
    orb2: 'from-cyan-500/15 to-blue-500/15',
    iconClass: 'text-blue-400',
    textClass: 'text-blue-300',
    borderClass: 'border-blue-500/30',
  },
  bishop: {
    label: 'BISHOP ARENA',
    Icon: Star,
    gradient: 'from-purple-600 via-purple-500 to-indigo-500',
    headerBg: 'from-purple-900/40 via-purple-800/30 to-black/40',
    bgGradient: 'from-purple-900/20 via-black to-indigo-900/20',
    orb1: 'from-purple-500/15 to-indigo-500/15',
    orb2: 'from-indigo-500/15 to-purple-500/15',
    iconClass: 'text-purple-400',
    textClass: 'text-purple-300',
    borderClass: 'border-purple-500/30',
  },
  rook: {
    label: 'ROOK ARENA',
    Icon: Swords,
    gradient: 'from-orange-600 via-orange-500 to-amber-500',
    headerBg: 'from-orange-900/40 via-orange-800/30 to-black/40',
    bgGradient: 'from-orange-900/20 via-black to-amber-900/20',
    orb1: 'from-orange-500/15 to-amber-500/15',
    orb2: 'from-amber-500/15 to-orange-500/15',
    iconClass: 'text-orange-400',
    textClass: 'text-orange-300',
    borderClass: 'border-orange-500/30',
  },
  queen: {
    label: 'QUEEN ARENA',
    Icon: Crown,
    gradient: 'from-pink-600 via-pink-500 to-rose-500',
    headerBg: 'from-pink-900/40 via-pink-800/30 to-black/40',
    bgGradient: 'from-pink-900/20 via-black to-rose-900/20',
    orb1: 'from-pink-500/15 to-rose-500/15',
    orb2: 'from-rose-500/15 to-pink-500/15',
    iconClass: 'text-pink-400',
    textClass: 'text-pink-300',
    borderClass: 'border-pink-500/30',
  },
  king: {
    label: 'KING ARENA',
    Icon: Gem,
    gradient: 'from-yellow-500 via-amber-400 to-orange-400',
    headerBg: 'from-yellow-900/40 via-amber-800/30 to-black/40',
    bgGradient: 'from-yellow-900/20 via-black to-orange-900/20',
    orb1: 'from-yellow-500/20 to-orange-500/20',
    orb2: 'from-orange-500/20 to-yellow-500/20',
    iconClass: 'text-yellow-400',
    textClass: 'text-yellow-300',
    borderClass: 'border-yellow-500/30',
  },
};

export const WaitingRoomHeader: React.FC<WaitingRoomHeaderProps> = ({
  roomData,
  onLeave,
}) => {
  const tier = getTierFromEntryFee(roomData.entry_fee);
  const tierConfig = TIER_CONFIG[tier];
  const TierIcon = tierConfig.Icon;
  const isRoboChaos = roomData.mode === 'robochaos';

  return (
    <div className={`relative p-3 sm:p-4 border-b ${
      isRoboChaos ? 'border-pink-500/30' : tierConfig.borderClass
    } backdrop-blur-sm overflow-hidden`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${
        isRoboChaos
          ? 'from-purple-900/40 via-pink-900/30 to-red-900/40'
          : tierConfig.headerBg
      }`} />

      {/* Animated particles for RoboChaos */}
      {isRoboChaos && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-pink-400/60 rounded-full"
              initial={{
                x: `${Math.random() * 100}%`,
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

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          {/* Leave Button */}
          <button
            onClick={onLeave}
            className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-black/40 hover:bg-black/60 border border-white/20 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-xs sm:text-sm hidden sm:inline">Leave</span>
          </button>

          {/* Center: Arena Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Arena Icon */}
            <motion.div
              animate={isRoboChaos ? {
                rotate: [0, -5, 5, -5, 0],
                scale: [1, 1.05, 1],
              } : { scale: [1, 1.05, 1] }}
              transition={{
                duration: isRoboChaos ? 2 : 3,
                repeat: Infinity,
              }}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                isRoboChaos
                  ? 'from-purple-500/30 to-pink-500/30 border-2 border-pink-400/50'
                  : `${tierConfig.gradient} opacity-90 border-2 ${tierConfig.borderClass}`
              }`}
            >
              <TierIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                isRoboChaos ? 'text-pink-300' : tierConfig.iconClass
              } drop-shadow-lg`} />
            </motion.div>

            {/* Arena Name + Mode */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-sm sm:text-lg font-black tracking-wider ${
                  isRoboChaos
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-red-300'
                    : tierConfig.textClass
                }`}>
                  {tierConfig.label}
                </h1>
                {isRoboChaos && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                  </motion.div>
                )}
              </div>
              <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs ${
                isRoboChaos ? 'text-pink-400' : 'text-gray-400'
              } font-medium`}>
                <span>{isRoboChaos ? '🤖' : '👁️‍🗨️'}</span>
                <span>{isRoboChaos ? 'RoboChaos Mode' : 'Classic Blind'}</span>
                <span className="mx-1">•</span>
                <span>5+0</span>
              </div>
            </div>
          </div>

          {/* Right: Entry Fee (compact) */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border backdrop-blur-sm ${
            isRoboChaos
              ? 'bg-pink-900/30 border-pink-500/40'
              : 'bg-black/30 border-white/20'
          }`}>
            <span className="text-xs">🪙</span>
            <span className={`text-xs sm:text-sm font-black ${
              isRoboChaos ? 'text-pink-300' : tierConfig.textClass
            }`}>
              {roomData.entry_fee}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
