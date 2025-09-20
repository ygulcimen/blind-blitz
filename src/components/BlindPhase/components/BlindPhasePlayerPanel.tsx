// components/BlindPhase/components/BlindPhasePlayerPanel.tsx
import React from 'react';
import { BlindPlayerCard } from './BlindPlayerCard';
import { BlindBattleSequence } from './BlindBattleSequence';
import type { BlindPhasePlayer } from '../../../hooks/useBlindPhaseState';

interface BlindPhasePlayerPanelProps {
  myPlayerData: BlindPhasePlayer;
  myMoves: any[];
  mySubmitted: boolean;
  maxMoves: number;
  remainingMoves: number;
}

export const BlindPhasePlayerPanel: React.FC<BlindPhasePlayerPanelProps> = ({
  myPlayerData,
  myMoves,
  mySubmitted,
  maxMoves,
  remainingMoves,
}) => {
  return (
    <div className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col relative">
      {/* Panel glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Player Card */}
        <div className="mb-4">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border-2 border-purple-500/50 rounded-xl p-4 shadow-2xl shadow-purple-500/20 relative">
            <div className="text-center">
              <div className="relative inline-block mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-lg drop-shadow-lg">
                    {myPlayerData.name[0]}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-black mb-1 tracking-wide text-white">
                {myPlayerData.name}
              </h3>

              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="w-3 h-3 text-yellow-400">⭐</span>
                <span className="text-yellow-400 font-bold text-sm">
                  {myPlayerData.rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Sequence */}
        <div className="flex-1">
          <BlindBattleSequence myMoves={myMoves} maxMoves={maxMoves} />
        </div>

        {/* Bottom Stats */}
        <div className="mt-4 p-3 border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-300 font-medium mb-1">
              ⚔️ Battle Rules ⚔️
            </div>
            <div className="text-xs text-gray-500">
              Max 2 strikes per piece • {remainingMoves} remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
