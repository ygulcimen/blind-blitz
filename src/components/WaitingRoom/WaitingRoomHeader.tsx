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
          prizeBoxGradient: 'from-blue-900/80 to-indigo-900/80',
          prizeBorder: 'border-blue-500/50',
          dividerColor: 'via-blue-400/50',
        };
      case 'robochaos':
        return {
          name: 'RoboChaos',
          subtitle: 'AI trolls make your opening',
          icon: '🤖',
          gradient: 'from-red-600 via-orange-500 to-yellow-500',
          prizeBoxGradient: 'from-purple-900/80 to-red-900/80',
          prizeBorder: 'border-purple-500/50',
          dividerColor: 'via-purple-400/50',
        };
      default:
        return {
          name: 'Unknown Mode',
          subtitle: 'Unknown challenge awaits',
          icon: '❓',
          gradient: 'from-slate-500 to-slate-600',
          prizeBoxGradient: 'from-gray-900/80 to-slate-900/80',
          prizeBorder: 'border-gray-500/50',
          dividerColor: 'via-gray-400/50',
        };
    }
  };

  const mode = getModeConfig(roomData.mode);
  const prizePool = roomData.entry_fee * 2;

  return (
    <div className="p-3 sm:p-5 border-b border-white/20 backdrop-blur-sm bg-black/30">
      <div className="max-w-6xl mx-auto">
        {/* Mobile: Stacked Layout, Desktop: Horizontal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <button
            onClick={onLeave}
            className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-xs sm:text-sm">Leave</span>
          </button>

          {/* Room Info - Mobile: Stacked, Desktop: Horizontal */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 w-full sm:w-auto">
            {/* Mode Info */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${mode.gradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl`}
              >
                <span className="text-xl sm:text-2xl drop-shadow-lg">{mode.icon}</span>
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black tracking-wide">
                  {roomData.name}
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                  {mode.subtitle}
                </p>
              </div>
            </div>

            {/* Prize Info - Compact on mobile */}
            <div className={`bg-gradient-to-r ${mode.prizeBoxGradient} backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 border-2 ${mode.prizeBorder} shadow-2xl w-full sm:w-auto`}>
              <div className="flex items-center gap-3 sm:gap-5 justify-around sm:justify-start">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                    <span className="text-xs sm:text-sm">💰</span>
                    <span className="text-gray-200 text-[10px] sm:text-xs uppercase tracking-wider font-bold">
                      Entry
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                    <span className="text-red-400 font-black text-xs sm:text-sm">
                      {roomData.entry_fee}
                    </span>
                    <span className="text-xs sm:text-sm">🪙</span>
                  </div>
                </div>
                <div className={`w-px h-5 sm:h-6 bg-gradient-to-b from-transparent ${mode.dividerColor} to-transparent`} />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                    <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />
                    <span className="text-gray-200 text-[10px] sm:text-xs uppercase tracking-wider font-bold">
                      Prize
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                    <span className="text-green-400 font-black text-xs sm:text-sm">
                      {prizePool}
                    </span>
                    <span className="text-xs sm:text-sm">🪙</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
