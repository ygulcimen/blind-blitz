// src/screens/LobbyPage/components/TopPlayers.tsx
import React from 'react';
import { Crown, Flame } from 'lucide-react';

interface TopPlayersProps {
  players: Array<{
    name: string;
    gold: number;
    streak: number;
  }>;
}

export const TopPlayers: React.FC<TopPlayersProps> = ({ players }) => (
  <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
    <h3 className="font-bold mb-3 flex items-center gap-2">
      <Crown className="w-4 h-4 text-yellow-400" />
      Top Gold Earners
    </h3>
    <div className="space-y-2">
      {players.map((player, index) => (
        <div
          key={player.name}
          className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50"
        >
          <div
            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
              index === 0
                ? 'bg-yellow-500 text-black'
                : index === 1
                ? 'bg-gray-400 text-black'
                : 'bg-orange-500 text-black'
            }`}
          >
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{player.name}</div>
            <div className="text-xs text-yellow-400">
              {player.gold.toLocaleString()}g earned
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-xs font-bold">{player.streak}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
