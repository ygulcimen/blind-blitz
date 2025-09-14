// src/screens/LobbyPage/components/LiveStats.tsx
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface LiveStatsProps {
  stats: {
    playersOnline: number;
    activeGames: number;
    peakToday: number;
  };
}

export const LiveStats: React.FC<LiveStatsProps> = ({ stats }) => (
  <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
    <h3 className="font-bold mb-3 flex items-center gap-2">
      <TrendingUp className="w-4 h-4 text-emerald-400" />
      Live Arena
    </h3>
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Warriors Online</span>
        <span className="text-emerald-400 font-semibold">
          {stats.playersOnline.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Active Battles</span>
        <span className="text-blue-400 font-semibold">{stats.activeGames}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Peak Today</span>
        <span className="text-purple-400 font-semibold">
          {stats.peakToday.toLocaleString()}
        </span>
      </div>
    </div>
  </div>
);
