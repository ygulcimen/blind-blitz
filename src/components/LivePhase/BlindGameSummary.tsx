// components/LivePhase/BlindGameSummary.tsx
import React from 'react';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
}

interface BlindData {
  p1Moves: any[];
  p2Moves: any[];
  revealLog: MoveLogItem[];
}

interface BlindGameSummaryProps {
  blindData: BlindData;
}

const BlindGameSummary: React.FC<BlindGameSummaryProps> = ({ blindData }) => {
  const stats = {
    whiteMoves: blindData.p1Moves.length,
    blackMoves: blindData.p2Moves.length,
    totalSubmitted: blindData.p1Moves.length + blindData.p2Moves.length,
    totalRevealed: blindData.revealLog.length,
    validMoves: blindData.revealLog.filter((m) => !m.isInvalid).length,
    invalidMoves: blindData.revealLog.filter((m) => m.isInvalid).length,
    accuracy:
      blindData.revealLog.length > 0
        ? Math.round(
            (blindData.revealLog.filter((m) => !m.isInvalid).length /
              blindData.revealLog.length) *
              100
          )
        : 0,
  };

  const SummaryBox = ({
    label,
    value,
    icon,
    color,
  }: {
    label: string;
    value: number | string;
    icon?: string;
    color?: string;
  }) => (
    <div className={`rounded-md p-1 text-xs ${color || 'text-white'}`}>
      <div className="flex justify-between items-center px-1">
        <span className="text-gray-400 flex items-center gap-1">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span className="font-bold">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="w-[95%] max-w-[180px] rounded-lg p-2 bg-gray-800/50 space-y-2 text-xs">
      <div className="text-center font-bold text-blue-300 flex items-center justify-center gap-1 text-sm">
        <span>👁️</span> <span>Blind Summary</span>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <SummaryBox label="⚪ White" value={stats.whiteMoves} />
        <SummaryBox label="⚫ Black" value={stats.blackMoves} />
        <SummaryBox
          label="✅ Valid"
          value={stats.validMoves}
          color="text-green-400"
        />
        <SummaryBox
          label="❌ Invalid"
          value={stats.invalidMoves}
          color="text-red-400"
        />
      </div>

      <div className="text-center text-yellow-400 font-bold pt-1 border-t border-gray-700">
        Accuracy: {stats.accuracy}%
      </div>

      <div className="text-center text-[10px] text-gray-400">
        {stats.totalSubmitted} moves submitted
      </div>
    </div>
  );
};

export default BlindGameSummary;
