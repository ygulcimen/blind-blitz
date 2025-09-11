// components/LivePhase/PotDisplay.tsx - Redesigned
import React, { useState, useEffect } from 'react';
import { goldRewardsService } from '../../services/goldRewardsService';

interface PotDisplayProps {
  gameId: string;
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ gameId }) => {
  const [remainingPot, setRemainingPot] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    goldRewardsService.getRemainingPot(gameId).then((pot) => {
      setRemainingPot(pot);
      setLoading(false);
    });
  }, [gameId]);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-4 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        <div className="relative text-center">
          <div className="text-sm text-amber-100/80 font-medium">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-4 shadow-lg border border-yellow-400/30">
      {/* Treasure chest icon background */}
      <div className="absolute top-1 right-1 text-4xl opacity-20">💰</div>

      {/* Animated shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />

      <div className="relative text-center">
        <div className="text-sm text-amber-100/90 font-bold uppercase tracking-wider mb-1">
          Victory Prize
        </div>
        <div className="text-2xl font-black text-white drop-shadow-lg">
          {remainingPot.toLocaleString()}
        </div>
        <div className="text-xs text-amber-200/80 font-medium mt-1">
          Winner takes all
        </div>
      </div>
    </div>
  );
};
