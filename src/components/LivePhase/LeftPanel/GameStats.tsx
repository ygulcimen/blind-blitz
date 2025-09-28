import React, { useMemo } from 'react';
import { Card } from '../../ui/card';
import type { LiveMove } from '../../../services/liveMovesService';

interface GameStatsProps {
  liveMoves: LiveMove[];
  className?: string;
}

export const GameStats: React.FC<GameStatsProps> = ({
  liveMoves,
  className = '',
}) => {
  const stats = useMemo(() => {
    const totalMoves = liveMoves.length;

    // Calculate average move time
    const moveTimes = liveMoves
      .filter(move => move.created_at)
      .map((move, index) => {
        if (index === 0) return 0;
        const prevMove = liveMoves[index - 1];
        if (!prevMove.created_at) return 0;
        return new Date(move.created_at).getTime() - new Date(prevMove.created_at).getTime();
      })
      .filter(time => time > 0);

    const avgMoveTime = moveTimes.length > 0
      ? Math.round(moveTimes.reduce((sum, time) => sum + time, 0) / moveTimes.length / 1000)
      : 0;

    // Count captures (rough estimate based on notation)
    const captures = liveMoves.filter(move =>
      move.move_san?.includes('x') || move.move_san?.includes('X')
    ).length;

    // Count checks
    const checks = liveMoves.filter(move =>
      move.move_san?.includes('+') || move.move_san?.includes('#')
    ).length;

    return {
      totalMoves,
      avgMoveTime,
      captures,
      checks,
    };
  }, [liveMoves]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card className={`p-4 hover:bg-white/10 transition-all duration-300 ${className}`}>
      <h3 className="text-sm font-semibold text-white mb-3">📊 Game Stats</h3>

      <div className="space-y-2 text-sm">
        {/* Total Moves */}
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Moves:</span>
          <span className="text-white font-medium">{stats.totalMoves}</span>
        </div>

        {/* Average Move Time */}
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Avg Time:</span>
          <span className="text-white font-medium">
            {stats.avgMoveTime > 0 ? formatTime(stats.avgMoveTime) : '—'}
          </span>
        </div>

        {/* Captures */}
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Captures:</span>
          <span className="text-orange-400 font-medium">{stats.captures}</span>
        </div>

        {/* Checks */}
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Checks:</span>
          <span className="text-red-400 font-medium">{stats.checks}</span>
        </div>
      </div>
    </Card>
  );
};