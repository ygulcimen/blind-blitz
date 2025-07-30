import React from 'react';
import MoveHistoryList from './MoveHistoryList';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
}

interface ChronicleLogProps {
  whiteMoves: MoveLogItem[];
  blackMoves: MoveLogItem[];
  liveMoveHistory: string[];
  compact?: boolean;
}

const ChronicleLog: React.FC<ChronicleLogProps> = ({
  whiteMoves,
  blackMoves,
  liveMoveHistory,
  compact = false,
}) => {
  return (
    <MoveHistoryList
      whiteMoves={whiteMoves}
      blackMoves={blackMoves}
      liveMoveHistory={liveMoveHistory}
      compact={compact}
    />
  );
};

export default ChronicleLog;
