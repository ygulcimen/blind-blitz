// src/screens/LobbyPage/components/LobbyHeader.tsx
import React from 'react';
import { Coins, Plus, TrendingUp } from 'lucide-react';

interface LobbyHeaderProps {
  playerGold: number;
  onCreateRoom: () => void;
}

export const LobbyHeader: React.FC<LobbyHeaderProps> = ({
  playerGold,
  onCreateRoom,
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-400 text-sm">2,847 players online</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Game Lobby
          </h1>

          <p className="text-gray-400 max-w-xl">
            Find your perfect match or create your own battlefield. Every game
            is a chance to earn gold and climb the ranks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Gold Balance */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl px-4 py-2.5 flex items-center gap-2 hover:border-gray-600 transition-colors">
            <Coins className="w-5 h-5 text-yellow-400" />
            <div>
              <span className="text-white font-bold">
                {playerGold.toLocaleString()}
              </span>
              <span className="text-gray-500 text-xs ml-1">Gold</span>
            </div>
            <div className="ml-2 flex items-center gap-1 text-green-400 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>+12%</span>
            </div>
          </div>

          {/* Create Room Button */}
          <button
            onClick={onCreateRoom}
            className="bg-white text-black px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Create Room</span>
          </button>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-900/40 rounded-xl border border-gray-800">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Active Games</div>
          <div className="text-lg font-bold text-white">384</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Avg. Wait Time</div>
          <div className="text-lg font-bold text-green-400">3.2s</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Prize Pool Today</div>
          <div className="text-lg font-bold text-yellow-400">125K</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Your Win Rate</div>
          <div className="text-lg font-bold text-blue-400">67%</div>
        </div>
      </div>
    </div>
  );
};
