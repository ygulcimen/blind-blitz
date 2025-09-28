import React from 'react';
import type { GameResult } from '../../../types/GameTypes';

interface GameStatusOverlayProps {
  gameEndStatus: string | null;
  gameResult: GameResult | null;
}

export const GameStatusOverlay: React.FC<GameStatusOverlayProps> = ({
  gameEndStatus,
  gameResult,
}) => {
  if (!gameEndStatus) return null;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-xl blur-lg animate-pulse" />
        <div className="relative bg-gray-900/95 border border-red-500/50 rounded-xl px-6 py-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {gameResult?.type === 'checkmate'
                ? '👑'
                : gameResult?.type === 'timeout'
                ? '⏰'
                : gameResult?.type === 'resignation'
                ? '🏳️'
                : '⚖️'}
            </div>
            <h1 className="text-xl font-bold text-white">
              {gameEndStatus}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};