// components/WaitingRoom/WaitingRoomHeader.tsx
import React from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';

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

export const WaitingRoomHeader: React.FC<WaitingRoomHeaderProps> = ({
  roomData,
  onLeave,
}) => {
  const getModeConfig = (mode: 'classic' | 'robochaos') => {
    switch (mode) {
      case 'classic':
        return {
          name: 'Classic Blind',
          subtitle: 'First 5 moves in darkness',
          icon: '👁️‍🗨️',
          gradient: 'from-purple-700 via-indigo-600 to-blue-700',
        };
      case 'robochaos':
        return {
          name: 'RoboChaos',
          subtitle: 'AI trolls make your opening',
          icon: '🤖',
          gradient: 'from-red-600 via-orange-500 to-yellow-500',
        };
      default:
        return {
          name: 'Unknown Mode',
          subtitle: 'Unknown challenge awaits',
          icon: '❓',
          gradient: 'from-slate-500 to-slate-600',
        };
    }
  };

  const mode = getModeConfig(roomData.mode);
  const prizePool = roomData.entry_fee * 2;

  return (
    <div className="p-5 border-b border-white/20 backdrop-blur-sm bg-black/30">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <button
          onClick={onLeave}
          className="group flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 rounded-xl transition-all duration-200 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Leave Room</span>
        </button>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div
              className={`relative w-12 h-12 bg-gradient-to-br ${mode.gradient} rounded-xl flex items-center justify-center shadow-2xl`}
            >
              <span className="text-2xl drop-shadow-lg">{mode.icon}</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide">
                {roomData.name}
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                {mode.subtitle}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-900/80 to-amber-900/80 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-yellow-600/50 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-yellow-400 text-sm">💰</span>
                  <span className="text-yellow-200 text-xs uppercase tracking-wider font-bold">
                    Entry Fee
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-red-400 font-black text-sm">
                    {roomData.entry_fee}
                  </span>
                  <span className="text-yellow-400 text-sm">🪙</span>
                </div>
              </div>
              <div className="w-px h-6 bg-gradient-to-b from-transparent via-yellow-400/50 to-transparent" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-200 text-xs uppercase tracking-wider font-bold">
                    Prize Pool
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-green-400 font-black text-sm">
                    {prizePool}
                  </span>
                  <span className="text-yellow-400 text-sm">🪙</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
