// src/screens/LobbyPage/components/StakeCard.tsx - Refined Version
import React from 'react';
import {
  Users,
  Play,
  Shield,
  Swords,
  Crown,
  Gem,
  Star,
  Lock,
  Coins,
  Clock,
} from 'lucide-react';

interface StakeCardProps {
  minStake: number;
  maxStake: number;
  displayRange: string;
  tier: 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
  playerCount: number;
  canAfford: boolean;
  isSearching?: boolean;
  onQuickMatch: () => void;
}

const TIER_CONFIG = {
  pawn: {
    label: 'Pawn Arena',
    Icon: Shield,
    colors: {
      primary: 'emerald',
      bg: 'from-emerald-950/50 to-emerald-900/30',
      border: 'border-emerald-500/30',
      text: 'text-emerald-300',
      accent: 'text-emerald-400',
      button: 'from-emerald-500 to-emerald-600',
      glow: 'shadow-emerald-500/20',
    },
  },
  knight: {
    label: 'Knight Arena',
    Icon: Swords,
    colors: {
      primary: 'blue',
      bg: 'from-blue-950/50 to-blue-900/30',
      border: 'border-blue-500/30',
      text: 'text-blue-300',
      accent: 'text-blue-400',
      button: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/20',
    },
  },
  bishop: {
    label: 'Bishop Arena',
    Icon: Star,
    colors: {
      primary: 'purple',
      bg: 'from-purple-950/50 to-purple-900/30',
      border: 'border-purple-500/30',
      text: 'text-purple-300',
      accent: 'text-purple-400',
      button: 'from-purple-500 to-purple-600',
      glow: 'shadow-purple-500/20',
    },
  },
  rook: {
    label: 'Rook Arena',
    Icon: Swords,
    colors: {
      primary: 'orange',
      bg: 'from-orange-950/50 to-orange-900/30',
      border: 'border-orange-500/30',
      text: 'text-orange-300',
      accent: 'text-orange-400',
      button: 'from-orange-500 to-orange-600',
      glow: 'shadow-orange-500/20',
    },
  },
  queen: {
    label: 'Queen Arena',
    Icon: Crown,
    colors: {
      primary: 'pink',
      bg: 'from-pink-950/50 to-pink-900/30',
      border: 'border-pink-500/30',
      text: 'text-pink-300',
      accent: 'text-pink-400',
      button: 'from-pink-500 to-pink-600',
      glow: 'shadow-pink-500/20',
    },
  },
  king: {
    label: 'King Arena',
    Icon: Gem,
    colors: {
      primary: 'yellow',
      bg: 'from-yellow-950/50 to-yellow-900/30',
      border: 'border-yellow-500/30',
      text: 'text-yellow-300',
      accent: 'text-yellow-400',
      button: 'from-yellow-500 to-yellow-600',
      glow: 'shadow-yellow-500/20',
    },
  },
} as const;

export const StakeCard: React.FC<StakeCardProps> = ({
  minStake,
  maxStake,
  displayRange,
  tier,
  playerCount,
  canAfford,
  isSearching = false,
  onQuickMatch,
}) => {
  const config = TIER_CONFIG[tier];
  const { Icon, label, colors } = config;

  return (
    <div className="group relative">
      <button
        onClick={() => canAfford && !isSearching && onQuickMatch()}
        disabled={!canAfford || isSearching}
        className={`relative w-full h-64 rounded-2xl overflow-hidden transition-all duration-300 ${
          canAfford && !isSearching
            ? 'hover:-translate-y-1 hover:scale-[1.02] cursor-pointer'
            : 'cursor-not-allowed'
        }`}
      >
        {/* Background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colors.bg} ${colors.border} border backdrop-blur-sm`}
        />

        {/* Searching overlay */}
        {isSearching && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mb-2 mx-auto" />
              <div className="text-white text-sm font-semibold">
                Searching...
              </div>
            </div>
          </div>
        )}

        {/* Shimmer effect */}
        {canAfford && !isSearching && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute left-0 top-0 h-full w-1/3 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        )}

        {/* Chess piece watermark */}
        <div className="absolute top-4 right-4 opacity-[0.08] pointer-events-none">
          <Icon className="w-16 h-16" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full p-5 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={`flex items-center gap-2 px-2 py-1 rounded-lg bg-black/20 border ${colors.border}`}
            >
              <Icon className={`w-4 h-4 ${colors.text}`} />
              <span className={`text-xs font-semibold ${colors.text}`}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="w-3 h-3" />
              <span>{playerCount}</span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-xl bg-black/30 border ${colors.border} ${colors.glow} flex items-center justify-center mb-3`}
            >
              <Icon className={`w-6 h-6 ${colors.accent}`} />
            </div>

            {/* Title */}
            <h3 className={`text-lg font-bold ${colors.text} mb-2`}>{label}</h3>

            {/* Gold range */}
            <div className="flex items-center gap-1 mb-1">
              <Coins className={`w-4 h-4 ${colors.accent}`} />
              <span className={`text-sm font-bold ${colors.accent}`}>
                {displayRange}
              </span>
              <span className="text-xs text-gray-400">gold</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>~10s</span>
            </div>

            <div className="flex items-center">
              {canAfford ? (
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-r ${colors.button} ${colors.glow} flex items-center justify-center hover:scale-110 transition-transform`}
                >
                  <Play className="w-3 h-3 text-white" fill="white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                  <Lock className="w-3 h-3 text-gray-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disabled overlay */}
        {!canAfford && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
              Need {minStake} gold
            </div>
          </div>
        )}
      </button>
    </div>
  );
};
