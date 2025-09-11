import React, { useState, useEffect } from 'react';
import {
  goldRewardsService,
  type BlindPhaseResults,
} from '../../services/goldRewardsService';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface BlindPhaseGoldSummaryProps {
  gameId: string;
}

export const BlindPhaseGoldSummary: React.FC<BlindPhaseGoldSummaryProps> = ({
  gameId,
}) => {
  const { playerData } = useCurrentUser();
  const [results, setResults] = useState<BlindPhaseResults | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    goldRewardsService.getBlindPhaseResults(gameId).then(setResults);
  }, [gameId]);

  if (!results || !playerData) return null;

  // Don't show for RoboChaos mode
  if (results.game_mode === 'robot_chaos') return null;

  const isWhite = results.white_player_id === playerData.id;
  const myGold = isWhite ? results.white_total_gold : results.black_total_gold;
  const opponentGold = isWhite
    ? results.black_total_gold
    : results.white_total_gold;

  const getPerformanceIcon = (amount: number) => {
    if (amount > 15) return '🏆'; // Excellent
    if (amount > 5) return '⚔️'; // Good
    if (amount >= 0) return '🛡️'; // Neutral/defensive
    return '💥'; // Poor/penalty
  };

  const getPerformanceLabel = (amount: number) => {
    if (amount > 15) return 'Dominant';
    if (amount > 5) return 'Strong';
    if (amount >= 0) return 'Steady';
    return 'Struggling';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-600/40 shadow-lg overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 hover:bg-white/5 transition-all duration-200 group"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getPerformanceIcon(myGold)}</span>
            <span className="text-sm font-medium text-slate-300">
              Blind Section Rewards
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div
                className={`text-lg font-bold ${
                  myGold >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {myGold >= 0 ? '+' : ''}
                {myGold}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {getPerformanceLabel(myGold)}
              </div>
            </div>

            <div
              className={`text-slate-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            >
              ▶
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-700/50">
          <div className="grid grid-cols-2 gap-3 mt-3">
            {/* Your Performance */}
            <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getPerformanceIcon(myGold)}</span>
                <span className="text-blue-300 font-medium text-sm">
                  Your Tactics
                </span>
              </div>
              <div
                className={`text-xl font-bold ${
                  myGold >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {myGold >= 0 ? '+' : ''}
                {myGold}
              </div>
              <div className="text-xs text-blue-200/70 mt-1">
                {getPerformanceLabel(myGold)} play
              </div>
            </div>

            {/* Opponent Performance */}
            <div className="bg-red-900/30 rounded-lg p-3 border border-red-700/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {getPerformanceIcon(opponentGold)}
                </span>
                <span className="text-red-300 font-medium text-sm">
                  Enemy Tactics
                </span>
              </div>
              <div
                className={`text-xl font-bold ${
                  opponentGold >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {opponentGold >= 0 ? '+' : ''}
                {opponentGold}
              </div>
              <div className="text-xs text-red-200/70 mt-1">
                {getPerformanceLabel(opponentGold)} play
              </div>
            </div>
          </div>

          {/* Performance Comparison */}
          <div className="bg-slate-700/30 rounded-lg p-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Tactical Advantage:</span>
              <span
                className={`font-bold ${
                  myGold > opponentGold
                    ? 'text-emerald-400'
                    : myGold < opponentGold
                    ? 'text-red-400'
                    : 'text-slate-300'
                }`}
              >
                {myGold > opponentGold
                  ? `+${myGold - opponentGold} (You lead)`
                  : myGold < opponentGold
                  ? `${myGold - opponentGold} (You trail)`
                  : 'Even match'}
              </span>
            </div>
          </div>

          {/* Detailed breakdown hint */}
          <div className="text-center">
            <div className="text-xs text-slate-400 bg-slate-700/20 rounded px-2 py-1 inline-block">
              💡 Rewards from moves, captures, and penalties
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
