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
} from 'lucide-react';
import type { GameRoom } from '../types/lobby.types';

interface RoomCardProps {
  room: GameRoom;
  onJoin: (roomId: string) => void;
  playerGold: number;
}

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

  const getStatusColor = () => {
    if (isFull) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (isWaiting)
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const getStatusText = () => {
    if (isFull) return 'Full';
    if (isWaiting) return `${room.maxPlayers - room.players} spot left`;
    return 'Open';
  };

  const getModeIcon = () => {
    return room.mode === 'robochaos' ? (
      <Bot className="w-5 h-5 text-purple-400" />
    ) : (
      <Eye className="w-5 h-5 text-blue-400" />
    );
  };

  const getModeGradient = () => {
    return room.mode === 'robochaos'
      ? 'from-purple-600 to-pink-600'
      : 'from-blue-600 to-cyan-600';
  };

  return (
    <div
      className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-gray-700 transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Effect Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getModeGradient()} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      {/* High Stakes Badge */}
      {isHighStakes && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
          <Zap className="w-3 h-3" />
          HIGH STAKES
        </div>
      )}

      {/* Room Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getModeIcon()}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white capitalize">
                  {room.mode === 'robochaos' ? 'RoboChaos' : 'Classic'}
                </span>
                {room.isPrivate && <Lock className="w-3 h-3 text-gray-500" />}
              </div>
              <span className="text-gray-500 text-xs">Room #{room.id}</span>
            </div>
          </div>

          <div
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}
          >
            {getStatusText()}
          </div>
        </div>

        {/* Host Info */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white">
            {room.host[0]}
          </div>
          <span className="text-gray-300">{room.host}</span>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs">{room.hostRating}</span>
          </div>
        </div>
      </div>

      {/* Room Details */}
      <div className="p-4 space-y-3">
        {/* Stakes Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800/30 rounded-lg p-2.5">
            <div className="text-gray-500 text-xs mb-1 flex items-center gap-1">
              <Coins className="w-3 h-3" />
              Entry
            </div>
            <div
              className={`font-bold ${
                canAfford ? 'text-white' : 'text-red-400'
              }`}
            >
              {room.entryFee > 0 ? `${room.entryFee}g` : 'Free'}
            </div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-2.5">
            <div className="text-gray-500 text-xs mb-1 flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Win
            </div>
            <div className="text-green-400 font-bold">
              {room.reward > 0 ? `${room.reward}g` : 'Glory'}
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{room.timeControl}</span>
            </div>
            <div className="text-gray-600">•</div>
            <div className="text-gray-400">{room.ratingRange}</div>
          </div>

          {/* Player Slots */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {[...Array(room.maxPlayers)].map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full border-2 border-gray-900 ${
                    i < room.players
                      ? 'bg-gradient-to-br from-blue-400 to-purple-400'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Join Button */}
        <button
          onClick={() => onJoin(room.id)}
          disabled={isFull || !canAfford}
          className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 ${
            isFull
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : !canAfford
              ? 'bg-gray-800 text-red-400 cursor-not-allowed border border-red-500/30'
              : room.mode === 'robochaos'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 active:scale-95'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-95'
          }`}
        >
          {isFull
            ? 'Room Full'
            : !canAfford
            ? 'Insufficient Gold'
            : 'Join Game'}
        </button>

        {/* Spectators (if any) */}
        {room.spectators && room.spectators > 0 && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span>{room.spectators} spectating</span>
          </div>
        )}
      </div>

      {/* Bottom Accent Line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${getModeGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
    </div>
  );
};
