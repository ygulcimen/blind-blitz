import React from 'react';

interface BattleStatsProps {
  total: number;
  blind: number;
  live: number;
  compact?: boolean;
}

const BattleStats: React.FC<BattleStatsProps> = ({
  total,
  blind,
  live,
  compact = false,
}) => {
  return (
    <div className="bg-black/40 backdrop-blur-lg rounded-xl p-4 border border-white/10 shadow-2xl">
      <h3 className="text-white font-bold text-sm mb-3 text-center">
        📊 {compact ? 'Stats' : 'Battle Stats'}
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg p-2 text-center border border-slate-500">
          <div className="text-slate-300 text-xs font-semibold mb-1">TOTAL</div>
          <div className="text-white font-black text-sm">{total}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-2 text-center border border-purple-500">
          <div className="text-purple-200 text-xs font-semibold mb-1">
            BLIND
          </div>
          <div className="text-white font-black text-sm">{blind}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-2 text-center border border-emerald-500">
          <div className="text-emerald-200 text-xs font-semibold mb-1">
            LIVE
          </div>
          <div className="text-white font-black text-sm">{live}</div>
        </div>
      </div>
    </div>
  );
};

export default BattleStats;
