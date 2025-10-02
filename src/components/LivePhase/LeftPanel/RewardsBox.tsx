import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { goldRewardsService, type BlindPhaseResults } from '../../../services/goldRewardsService';

interface RewardsBoxProps {
  gameId: string;
  myColor: 'white' | 'black';
  gameMode?: 'classic' | 'robot_chaos';
  className?: string;
}

export const RewardsBox: React.FC<RewardsBoxProps> = ({
  gameId,
  myColor,
  gameMode,
  className = '',
}) => {
  const [rewards, setRewards] = useState<BlindPhaseResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRewards = async () => {
      try {
        const data = await goldRewardsService.getBlindPhaseResults(gameId);
        // Override game_mode if passed from props (for robot_chaos)
        if (data && gameMode) {
          data.game_mode = gameMode;
        }
        setRewards(data);
      } catch (error) {
        console.error('Failed to load rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRewards();

    // Subscribe to real-time updates
    const unsubscribe = goldRewardsService.subscribeToGoldUpdates(gameId, (updatedRewards) => {
      // Override game_mode if passed from props (for robot_chaos)
      if (updatedRewards && gameMode) {
        updatedRewards.game_mode = gameMode;
      }
      setRewards(updatedRewards);
    });

    return () => {
      unsubscribe();
    };
  }, [gameId, gameMode]);

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <h3 className="text-sm font-semibold text-white mb-3">💰 Rewards</h3>
        <div className="space-y-2">
          <div className="animate-pulse bg-gray-700/50 h-4 rounded"></div>
          <div className="animate-pulse bg-gray-700/50 h-4 rounded"></div>
          <div className="animate-pulse bg-gray-700/50 h-4 rounded"></div>
        </div>
      </Card>
    );
  }

  const myRewards = myColor === 'white' ? rewards?.white_total_gold || 0 : rewards?.black_total_gold || 0;
  const opponentRewards = myColor === 'white' ? rewards?.black_total_gold || 0 : rewards?.white_total_gold || 0;

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-white mb-3">💰 Rewards</h3>

      <div className="space-y-2 text-sm">
        {/* My Rewards */}
        <div className="flex justify-between items-center">
          <span className="text-blue-300">You:</span>
          <span className="text-yellow-400 font-bold">+{myRewards}💰</span>
        </div>

        {/* Opponent Rewards */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Opponent:</span>
          <span className="text-yellow-400 font-bold">+{opponentRewards}💰</span>
        </div>

        {/* Remaining Pot */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-600">
          <span className="text-gray-300">Pot:</span>
          <span className="text-green-400 font-bold">{rewards?.remaining_pot || 0}💰</span>
        </div>
      </div>

      {/* Game Mode Indicator */}
      {rewards?.game_mode && (
        <div className="mt-3 pt-2 border-t border-gray-600">
          <span className="text-xs text-gray-500 capitalize">
            {rewards.game_mode === 'robot_chaos' ? 'Robot Chaos' : 'Classic'} Mode
          </span>
        </div>
      )}
    </Card>
  );
};