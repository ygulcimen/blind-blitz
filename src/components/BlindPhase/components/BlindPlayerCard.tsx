// components/BlindPhase/components/BlindPlayerCard.tsx
import React from 'react';
import { Crown, Star, Shield, Clock } from 'lucide-react';
import type { BlindPhasePlayer } from '../../../hooks/useBlindPhaseState';

interface BlindPlayerCardProps {
  player: BlindPhasePlayer;
  isMe: boolean;
  moveCount: number;
  submitted: boolean;
  maxMoves: number;
}

export const BlindPlayerCard: React.FC<BlindPlayerCardProps> = ({
  player,
  isMe,
  moveCount,
  submitted,
  maxMoves,
}) => {
  return (
    <div
      className={`bg-gradient-to-br backdrop-blur-sm border-2 rounded-xl p-4 shadow-2xl relative ${
        isMe
          ? 'from-blue-800/60 to-blue-900/80 border-blue-500/50 shadow-blue-500/20'
          : 'from-slate-800/60 to-slate-900/80 border-slate-500/50'
      }`}
    >
      {submitted && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-black px-2 py-1 rounded-lg text-xs font-black shadow-lg animate-bounce">
          ✅ SUBMITTED
        </div>
      )}

      <div className="text-center">
        <div className="relative inline-block mb-2">
          <div
            className={`w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-xl ${
              isMe
                ? 'from-blue-600 via-indigo-600 to-blue-700'
                : 'from-slate-600 via-gray-600 to-slate-700'
            }`}
          >
            <span className="text-white font-black text-lg drop-shadow-lg">
              {player.name[0]}
            </span>
          </div>
          {player.isHost && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
              <Crown className="w-3 h-3 text-white fill-current" />
            </div>
          )}
        </div>

        <h3 className="text-sm font-black mb-1 tracking-wide text-white">
          {player.name}
        </h3>

        <div className="flex items-center justify-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-yellow-400 font-bold text-sm">
            {player.rating}
          </span>
        </div>

        <div className="text-center mb-2">
          <div className="text-xs text-gray-400 mb-1">Moves Made</div>
          <div
            className={`text-lg font-black ${
              submitted ? 'text-green-400' : 'text-white'
            }`}
          >
            {moveCount}/{maxMoves}
          </div>
        </div>

        {submitted ? (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-900/40 text-green-300 text-xs">
            <Shield className="w-3 h-3" />
            <span className="font-bold">READY</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-900/40 text-orange-300 text-xs">
            <Clock className="w-3 h-3" />
            <span className="font-bold">PLANNING</span>
          </div>
        )}
      </div>
    </div>
  );
};
