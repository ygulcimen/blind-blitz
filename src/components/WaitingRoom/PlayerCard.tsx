// components/WaitingRoom/PlayerCard.tsx
import React from 'react';
import { Crown, Star, Shield, Sword } from 'lucide-react';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface RealPlayer {
  id: string;
  username: string;
  rating: number;
  ready: boolean;
  isHost: boolean;
}

interface ModeConfig {
  gradient: string;
  borderColor: string;
}

interface PlayerCardProps {
  player: RealPlayer;
  mode: ModeConfig;
  onReady: () => void;
  gameStarting: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  mode,
  onReady,
  gameStarting,
}) => {
  const { playerData } = useCurrentUser();
  const isCurrentPlayer = player.id === playerData?.id;

  return (
    <div
      className={`relative group transition-all duration-500 ${
        player.ready ? 'animate-pulse' : ''
      }`}
    >
      <div
        className={`relative bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full sm:w-56 md:w-64 transition-all duration-300 shadow-2xl ${
          player.ready
            ? `${mode.borderColor} shadow-green-500/30 scale-105`
            : 'border-slate-600/50 hover:border-slate-500/70'
        }`}
      >
        {player.ready && (
          <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black shadow-lg animate-bounce">
            ⚡ READY ⚡
          </div>
        )}

        <div className="text-center mb-4 sm:mb-6">
          <div className="relative inline-block mb-2 sm:mb-3">
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${mode.gradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl transform transition-transform hover:scale-110`}
            >
              <span className="text-white font-black text-lg sm:text-xl drop-shadow-lg">
                {player.username[0].toUpperCase()}
              </span>
            </div>
            {player.isHost && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md sm:rounded-lg flex items-center justify-center shadow-lg">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-current" />
              </div>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-black mb-1 sm:mb-2 tracking-wide truncate px-2">
            {player.username}
            {isCurrentPlayer && (
              <span className="text-cyan-400 font-normal text-sm sm:text-base"> (You)</span>
            )}
          </h3>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-yellow-400 font-black text-sm sm:text-base">
              {player.rating}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-xs ${
              player.isHost
                ? 'bg-purple-900/40 text-purple-300'
                : 'bg-blue-900/40 text-blue-300'
            }`}
          >
            {player.isHost ? (
              <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            ) : (
              <Sword className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            )}
            <span className="font-bold text-[10px] sm:text-xs">
              {player.isHost ? 'Host' : 'Player'}
            </span>
          </div>
        </div>

        {isCurrentPlayer && (
          <button
            onClick={onReady}
            disabled={gameStarting}
            className={`w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-sm sm:text-base transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
              gameStarting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : player.ready
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/30'
                : `bg-gradient-to-r ${mode.gradient} text-white hover:shadow-xl`
            }`}
          >
            {gameStarting
              ? '⏳ PROCESSING...'
              : player.ready
              ? '❌ NOT READY'
              : '✅ READY UP!'}
          </button>
        )}
      </div>
    </div>
  );
};
