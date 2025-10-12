// components/WaitingRoom/WaitingRoomHeader.tsx
import React from 'react';
import { ArrowLeft, Trophy, Shield, Swords, Star, Crown, Gem } from 'lucide-react';

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
const getTierFromEntryFee = (entryFee: number) => {
  if (entryFee >= 10 && entryFee <= 24) return 'pawn';
  if (entryFee >= 25 && entryFee <= 49) return 'knight';
  if (entryFee >= 50 && entryFee <= 99) return 'bishop';
  if (entryFee >= 100 && entryFee <= 249) return 'rook';
  if (entryFee >= 250 && entryFee <= 499) return 'queen';
  if (entryFee >= 500) return 'king';
  // Fallback
  return 'pawn';
};

const TIER_CONFIG = {
  pawn: {
    label: 'PAWN',
    Icon: Shield,
    bgClass: 'bg-emerald-900/30',
    borderClass: 'border-emerald-500/50',
    iconClass: 'text-emerald-400',
    textClass: 'text-emerald-300',
  },
  knight: {
    label: 'KNIGHT',
    Icon: Swords,
    bgClass: 'bg-blue-900/30',
    borderClass: 'border-blue-500/50',
    iconClass: 'text-blue-400',
    textClass: 'text-blue-300',
  },
  bishop: {
    label: 'BISHOP',
    Icon: Star,
    bgClass: 'bg-purple-900/30',
    borderClass: 'border-purple-500/50',
    iconClass: 'text-purple-400',
    textClass: 'text-purple-300',
  },
  rook: {
    label: 'ROOK',
    Icon: Swords,
    bgClass: 'bg-orange-900/30',
    borderClass: 'border-orange-500/50',
    iconClass: 'text-orange-400',
    textClass: 'text-orange-300',
  },
  queen: {
    label: 'QUEEN',
    Icon: Crown,
    bgClass: 'bg-pink-900/30',
    borderClass: 'border-pink-500/50',
    iconClass: 'text-pink-400',
    textClass: 'text-pink-300',
  },
  king: {
    label: 'KING',
    Icon: Gem,
    bgClass: 'bg-yellow-900/30',
    borderClass: 'border-yellow-500/50',
    iconClass: 'text-yellow-400',
    textClass: 'text-yellow-300',
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
  const prizePool = roomData.entry_fee * 2;

  return (
    <div className="p-3 sm:p-4 border-b border-white/20 backdrop-blur-sm bg-black/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Leave Button */}
          <button
            onClick={onLeave}
            className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-xs sm:text-sm hidden xs:inline">Leave</span>
          </button>

          {/* Center: Arena Tier + Mode */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
            {/* Arena Tier Badge */}
            <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border ${
              isRoboChaos
                ? 'bg-pink-900/30 border-pink-500/50'
                : `${tierConfig.bgClass} ${tierConfig.borderClass}`
            }`}>
              <TierIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                isRoboChaos ? 'text-pink-400' : tierConfig.iconClass
              }`} />
              <span className={`text-[10px] sm:text-xs font-black tracking-wider ${
                isRoboChaos ? 'text-pink-300' : tierConfig.textClass
              }`}>
                {tierConfig.label}
              </span>
            </div>

            {/* Mode Badge */}
            <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg ${
              isRoboChaos
                ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 border border-pink-500/30'
                : 'bg-gradient-to-r from-indigo-600/80 to-purple-600/80 border border-indigo-500/30'
            }`}>
              <span className="text-xs sm:text-sm">{isRoboChaos ? '🤖' : '👁️‍🗨️'}</span>
              <span className="text-[10px] sm:text-xs font-bold hidden sm:inline">
                {isRoboChaos ? 'ROBOCHAOS' : 'CLASSIC'}
              </span>
            </div>

            {/* Game Type */}
            <div className="hidden md:flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
              <span>♟️</span>
              <span className="font-medium">5+0</span>
            </div>
          </div>

          {/* Right: Prize Pool */}
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-900/50 to-green-900/50 border border-green-500/40 rounded-lg">
            <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
            <div className="text-center">
              <div className="text-[10px] text-gray-400 leading-none mb-0.5 hidden sm:block">Prize</div>
              <div className="flex items-center gap-0.5">
                <span className="text-green-400 font-black text-xs sm:text-sm">{prizePool}</span>
                <span className="text-xs">🪙</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
