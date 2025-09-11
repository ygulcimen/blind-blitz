// components/shared/GameEndModal/GameEndModal.tsx
import React, { useState, useEffect } from 'react';
import type { GameResult } from '../../../types/GameTypes';
import {
  goldRewardsService,
  type BlindPhaseResults,
} from '../../../services/goldRewardsService';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

interface GameEndModalProps {
  isOpen: boolean;
  gameResult: GameResult | null;
  gameId: string;
  myColor: 'white' | 'black';
  onRematch?: () => void;
  onReturnToLobby: () => void;
  onClose: () => void;
}

export const GameEndModal: React.FC<GameEndModalProps> = ({
  isOpen,
  gameResult,
  gameId,
  myColor,
  onRematch,
  onReturnToLobby,
  onClose,
}) => {
  const { playerData } = useCurrentUser();
  const [blindResults, setBlindResults] = useState<BlindPhaseResults | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Early return if modal closed or no result

  // Load results when modal opens
  useEffect(() => {
    if (isOpen && gameId) {
      const loadResults = async () => {
        setLoading(true);
        const results = await goldRewardsService.getBlindPhaseResults(gameId);
        setBlindResults(results);
        setLoading(false);
      };
      loadResults();
    }
  }, [isOpen, gameId]);
  if (!isOpen || !gameResult) return null;

  const getResultInfo = () => {
    const isWinner = gameResult.winner === myColor;
    const isDraw = gameResult.winner === 'draw';

    switch (gameResult.type) {
      case 'checkmate':
        return {
          title: isWinner ? 'VICTORY!' : 'DEFEAT',
          subtitle: isWinner
            ? 'Checkmate! You crushed your opponent!'
            : 'Checkmate! You were defeated',
          icon: isWinner ? '👑' : '💀',
          bgColor: isWinner
            ? 'from-yellow-600 to-amber-700'
            : 'from-red-600 to-red-800',
          textColor: isWinner ? 'text-yellow-100' : 'text-red-100',
        };
      case 'timeout':
        return {
          title: isWinner ? 'VICTORY!' : 'DEFEAT',
          subtitle: isWinner
            ? 'Your opponent ran out of time!'
            : 'You ran out of time!',
          icon: isWinner ? '⏰' : '⏱️',
          bgColor: isWinner
            ? 'from-green-600 to-emerald-700'
            : 'from-red-600 to-red-800',
          textColor: isWinner ? 'text-green-100' : 'text-red-100',
        };
      case 'resignation':
        return {
          title: isWinner ? 'VICTORY!' : 'DEFEAT',
          subtitle: isWinner ? 'Your opponent surrendered!' : 'You surrendered',
          icon: isWinner ? '🏆' : '🏳️',
          bgColor: isWinner
            ? 'from-purple-600 to-violet-700'
            : 'from-gray-600 to-gray-800',
          textColor: isWinner ? 'text-purple-100' : 'text-gray-100',
        };
      case 'abandonment':
        return {
          title: isWinner ? 'VICTORY!' : 'DEFEAT',
          subtitle: isWinner
            ? 'Your opponent left the game!'
            : 'You left the game',
          icon: isWinner ? '🚪' : '💨',
          bgColor: isWinner
            ? 'from-orange-600 to-orange-700'
            : 'from-gray-600 to-gray-800',
          textColor: isWinner ? 'text-orange-100' : 'text-gray-100',
        };
      case 'draw':
      case 'stalemate':
        return {
          title: 'DRAW',
          subtitle:
            gameResult.type === 'stalemate'
              ? 'Stalemate - No legal moves!'
              : 'Peace treaty agreed!',
          icon: '⚖️',
          bgColor: 'from-blue-600 to-indigo-700',
          textColor: 'text-blue-100',
        };
      default:
        return {
          title: 'GAME OVER',
          subtitle: 'The battle has ended',
          icon: '🎯',
          bgColor: 'from-gray-600 to-gray-800',
          textColor: 'text-gray-100',
        };
    }
  };

  const calculateGoldEarned = () => {
    if (!blindResults || !playerData)
      return { blindPhase: 0, livePhase: 0, total: 0 };

    const isWinner = gameResult.winner === myColor;
    const isDraw = gameResult.winner === 'draw';
    const isWhite = blindResults.white_player_id === playerData.id;

    // Blind phase gold
    const blindPhaseGold = isWhite
      ? blindResults.white_total_gold
      : blindResults.black_total_gold;

    // Live phase gold
    let livePhaseGold = 0;
    if (isWinner) {
      livePhaseGold = blindResults.remaining_pot;
    } else if (isDraw) {
      livePhaseGold = Math.floor(blindResults.remaining_pot / 2);
    }

    return {
      blindPhase: blindPhaseGold,
      livePhase: livePhaseGold,
      total: blindPhaseGold + livePhaseGold,
    };
  };

  const resultInfo = getResultInfo();
  const goldEarned = calculateGoldEarned();
  const isWinner = gameResult.winner === myColor;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-lg w-full">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${resultInfo.bgColor} rounded-2xl blur-xl opacity-75 animate-pulse`}
        />

        <div className="relative bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-bounce">
              {resultInfo.icon}
            </div>
            <h1 className={`text-3xl font-black mb-2 ${resultInfo.textColor}`}>
              {resultInfo.title}
            </h1>
            <p className="text-gray-300 text-lg">{resultInfo.subtitle}</p>
          </div>

          {/* Gold Breakdown */}
          {loading ? (
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-6 bg-gray-600 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-600/30">
              <h3 className="text-lg font-bold text-white mb-4 text-center">
                Gold Summary
              </h3>

              <div className="space-y-3">
                {blindResults?.game_mode === 'classic' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Blind Phase Strategy:</span>
                    <span
                      className={`font-bold ${
                        goldEarned.blindPhase >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {goldEarned.blindPhase >= 0 ? '+' : ''}
                      {goldEarned.blindPhase} gold
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">
                    {gameResult.winner === 'draw'
                      ? 'Draw Split:'
                      : isWinner
                      ? 'Victory Reward:'
                      : 'Battle Result:'}
                  </span>
                  <span
                    className={`font-bold ${
                      goldEarned.livePhase > 0
                        ? 'text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {goldEarned.livePhase > 0 ? '+' : ''}
                    {goldEarned.livePhase} gold
                  </span>
                </div>

                <div className="border-t border-gray-600 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">
                      Total Earned:
                    </span>
                    <span className="text-2xl font-black text-yellow-400">
                      +{goldEarned.total} GOLD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3">
            {onRematch && gameResult.type !== 'abandonment' && (
              <button
                onClick={onRematch}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Rematch
              </button>
            )}

            <button
              onClick={onReturnToLobby}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Return to Lobby
            </button>

            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
