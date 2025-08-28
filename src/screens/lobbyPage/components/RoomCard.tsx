// src/screens/LobbyPage/components/RoomCard.tsx
import React, { useState } from 'react';
import {
  Clock,
  Users,
  Trophy,
  Coins,
  Eye,
  Bot,
  Lock,
  Star,
  TrendingUp,
  Zap,
  Shield,
  Target,
  Crown,
} from 'lucide-react';
import type { GameRoom } from '../types/lobby.types';

interface RoomCardProps {
  room: GameRoom;
  onJoin: (roomId: string) => void;
  playerGold: number;
}
const getTimeAgo = (dateString: string): string => {
  const now = Date.now();
  const created = new Date(dateString).getTime();
  const diffMinutes = Math.floor((now - created) / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return 'Old';
};

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onJoin,
  playerGold,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isFull = room.players === room.maxPlayers;
  const isWaiting = room.players > 0 && !isFull;
  const isEmpty = room.players === 0;
  const canAfford = playerGold >= room.entryFee;
  const isHighStakes = room.entryFee >= 500;
  const isPremiumRoom = room.entryFee >= 1000;

  const getStatusConfig = () => {
    // Check for problematic room states first
    if (room.game_started) {
      return {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        text: 'IN PROGRESS',
        pulse: false,
      };
    }

    if (room.game_ended) {
      return {
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
        text: 'FINISHED',
        pulse: false,
      };
    }

    // Check room age for abandoned detection
    const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    const roomAge = new Date(
      room.created_at || new Date().toISOString()
    ).getTime();
    if (room.players === 0 && roomAge < thirtyMinAgo) {
      return {
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
        text: 'ABANDONED',
        pulse: false,
      };
    }

    // Regular status logic
    if (isFull)
      return {
        color: 'bg-red-500/20 text-red-400 border-red-500/40',
        text: 'FULL',
        pulse: false,
      };
    if (isWaiting)
      return {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
        text: `${room.maxPlayers - room.players} SPOT LEFT`,
        pulse: true,
      };
    return {
      color: 'bg-green-500/20 text-green-400 border-green-500/40',
      text: 'OPEN',
      pulse: true,
    };
  };

  const getModeConfig = () => {
    return room.mode === 'robochaos'
      ? {
          icon: <Bot className="w-5 h-5 text-purple-400" />,
          name: 'RoboChaos',
          gradient: 'from-purple-600 via-pink-600 to-purple-700',
          accentColor: 'text-purple-400',
          bgGlow: 'group-hover:shadow-purple-500/20',
        }
      : {
          icon: <Eye className="w-5 h-5 text-blue-400" />,
          name: 'Classic Blind',
          gradient: 'from-blue-600 via-cyan-600 to-blue-700',
          accentColor: 'text-blue-400',
          bgGlow: 'group-hover:shadow-blue-500/20',
        };
  };

  const status = getStatusConfig();
  const mode = getModeConfig();

  return (
    <div
      className={`relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-2xl hover:border-gray-600/70 transition-all duration-500 overflow-hidden group hover:scale-[1.02] ${mode.bgGlow} hover:shadow-xl`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-[0.03] transition-all duration-500`}
      />

      {/* Premium Badges */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        {isPremiumRoom && (
          <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-orange-600 text-black text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
            <Crown className="w-3 h-3" />
            PREMIUM
          </div>
        )}
        {isHighStakes && !isPremiumRoom && (
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
            <Zap className="w-3 h-3" />
            HIGH STAKES
          </div>
        )}
        {room.isPrivate && (
          <div className="bg-gray-700/80 backdrop-blur-sm text-gray-300 text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1">
            <Lock className="w-3 h-3" />
            PRIVATE
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="p-5 border-b border-gray-700/30">
        <div className="flex items-start justify-between mb-4">
          {/* Mode Info */}
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${mode.gradient} rounded-xl flex items-center justify-center shadow-lg`}
            >
              {mode.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-white text-lg tracking-tight">
                  {mode.name}
                </span>
              </div>
              <span className="text-gray-400 text-sm font-medium">
                Room #{room.id}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
              status.color
            } ${
              status.pulse ? 'animate-pulse' : ''
            } shadow-lg backdrop-blur-sm`}
          >
            {status.text}
          </div>
        </div>

        {/* Host Profile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {room.host[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-gray-900"></div>
            </div>
            <div>
              <span className="text-white font-semibold text-sm">
                {room.host}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold">
                    {room.hostRating}
                  </span>
                </div>
                <div className="w-px h-3 bg-gray-600"></div>
                <span className="text-gray-500 text-xs">
                  {getTimeAgo(room.created_at || new Date().toISOString())}
                </span>
              </div>
            </div>
          </div>

          {/* Player Slots Visualization */}
          <div className="flex items-center gap-1">
            {[...Array(room.maxPlayers)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border ${
                  i < room.players
                    ? `bg-gradient-to-br ${mode.gradient} border-white/20`
                    : 'bg-gray-700/50 border-gray-600/50'
                } transition-all duration-300`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Game Details */}
      <div className="p-5 space-y-4">
        {/* Stakes Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                Entry Fee
              </span>
            </div>
            <div
              className={`font-black text-lg ${
                canAfford ? 'text-white' : 'text-red-400'
              }`}
            >
              {room.entryFee > 0 ? (
                <div className="flex items-center gap-1">
                  <span>{room.entryFee.toLocaleString()}</span>
                  <span className="text-yellow-400">🪙</span>
                </div>
              ) : (
                <span className="text-green-400">FREE</span>
              )}
            </div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                Win Reward
              </span>
            </div>
            <div className="text-green-400 font-black text-lg">
              {room.reward > 0 ? (
                <div className="flex items-center gap-1">
                  <span>{room.reward.toLocaleString()}</span>
                  <span className="text-yellow-400">🪙</span>
                </div>
              ) : (
                <span>GLORY</span>
              )}
            </div>
          </div>
        </div>

        {/* Game Configuration */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{room.timeControl}</span>
            </div>
            <div className="w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">{room.ratingRange}</span>
            </div>
          </div>

          {/* Live Indicator */}
          {!isEmpty && (
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">LIVE</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => onJoin(room.id)}
          disabled={
            isFull || !canAfford || room.game_started || room.game_ended
          }
          className={`w-full py-3 rounded-xl font-black text-sm tracking-wide transition-all duration-300 transform ${
            room.game_started || room.game_ended
              ? 'bg-gray-800/60 text-gray-500 cursor-not-allowed border border-gray-700/50'
              : isFull
              ? 'bg-gray-800/60 text-gray-500 cursor-not-allowed border border-gray-700/50'
              : !canAfford
              ? 'bg-red-900/40 text-red-400 cursor-not-allowed border border-red-500/40'
              : `bg-gradient-to-r ${mode.gradient} text-white hover:shadow-xl active:scale-95 hover:scale-105 shadow-lg border border-white/10`
          }`}
        >
          {room.game_started
            ? 'GAME IN PROGRESS'
            : room.game_ended
            ? 'GAME FINISHED'
            : isFull
            ? 'ROOM FULL'
            : !canAfford
            ? 'INSUFFICIENT GOLD'
            : `JOIN ${mode.name.toUpperCase()}`}
        </button>

        {/* Spectators Info */}
        {room.spectators && room.spectators > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-700/30">
            <Users className="w-3 h-3" />
            <span className="font-medium">
              {room.spectators} spectators watching
            </span>
          </div>
        )}
      </div>

      {/* Animated Bottom Accent */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${mode.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Hover Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-sm -z-10" />
    </div>
  );
};
