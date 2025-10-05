// src/screens/LobbyPage/components/LobbyHeader.tsx - Pure Matchmaking Header
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { ArrowLeft, Crown, Star, Coins, Zap } from 'lucide-react';

export const LobbyHeader: React.FC = () => {
  const navigate = useNavigate();
  const { playerData } = useCurrentUser();

  const handleBack = () => {
    navigate('/');
  };

  if (!playerData) return null;

  return (
    <div className="flex items-center justify-between mb-8">
      {/* Left: Back Button & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="group flex items-center gap-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600/50 rounded-xl transition-all duration-200 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm text-white">Back</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-xl">
              <span className="text-2xl font-black text-white">5</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-black" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              BLINDCHESS ARENA
            </h1>
            <p className="text-emerald-400 text-sm font-semibold">
              5+0 Signature Battles
            </p>
          </div>
        </div>
      </div>

      {/* Right: Player Info */}
      <div className="flex items-center gap-4">
        {/* Player Stats */}
        <div className="hidden md:flex items-center gap-6 bg-gray-900/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-gray-700/50">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">
              {playerData.rating || 1200}
            </span>
            <span className="text-gray-500 text-xs">Rating</span>
          </div>

          <div className="w-px h-6 bg-gray-600"></div>

          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">
              {(playerData.gold_balance || 0).toLocaleString()}
            </span>
            <span className="text-gray-500 text-xs">🪙</span>
          </div>

          <div className="w-px h-6 bg-gray-600"></div>

          <div className="text-center">
            <div className="text-white font-bold text-sm">
              {playerData.wins || 0}W - {playerData.losses || 0}L
            </div>
            <div className="text-gray-500 text-xs">Record</div>
          </div>
        </div>

        {/* Player Profile */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-blue-500/30">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">
                {playerData.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>

          <div className="hidden sm:block">
            <div className="text-white font-bold text-sm">
              {playerData.username || 'Warrior'}
            </div>
            <div className="text-gray-400 text-xs">
              Rating: {playerData.rating || 1200}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
