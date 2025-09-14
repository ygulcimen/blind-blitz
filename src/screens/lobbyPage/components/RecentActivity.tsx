import React from 'react';
import { Clock } from 'lucide-react';

interface RecentActivityProps {
  games: Array<{
    opponent: string;
    result: 'win' | 'loss';
    stakes: number;
    time: string;
  }>;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ games }) => (
  <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
    <h3 className="font-bold mb-3 flex items-center gap-2">
      <Clock className="w-4 h-4 text-blue-400" />
      Recent Battles
    </h3>
    <div className="space-y-2">
      {games.map((game, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/30 text-sm"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              game.result === 'win' ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
          <div className="flex-1">
            <div className="font-medium">{game.opponent}</div>
            <div className="text-xs text-gray-400">{game.time}</div>
          </div>
          <div className="text-right">
            <div
              className={`font-semibold ${
                game.result === 'win' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {game.result === 'win' ? '+' : '-'}
              {game.stakes}g
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
