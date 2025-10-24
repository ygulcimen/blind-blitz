// components/shared/GameEndModal/GameEndModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Home, X } from 'lucide-react';
import { Card } from '../../ui/card';
import type { GameResult } from '../../../types/GameTypes';
import {
  goldRewardsService,
  type BlindPhaseResults,
} from '../../../services/goldRewardsService';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

// Framer Motion button variants

const rematchButtonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    boxShadow: "0 8px 30px rgba(59, 130, 246, 0.5)",
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  },
  tap: {
    scale: 0.95,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

const homeButtonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    boxShadow: "0 8px 30px rgba(34, 197, 94, 0.5)",
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  },
  tap: {
    scale: 0.95,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

const closeButtonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  },
  tap: {
    scale: 0.9,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

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
    console.log('💰 Gold calculation debug:', {
      blindResults: blindResults,
      playerData: playerData,
      gameResult: gameResult,
      myColor: myColor
    });

    const isWinner = gameResult.winner === myColor;
    const isDraw = gameResult.winner === 'draw';

    // Mock data for draws when blindResults is not available
    if (!blindResults || !playerData) {
      if (isDraw) {
        // Mock draw scenario with reasonable values
        const mockBlindPhaseGold = 50; // Mock blind phase earnings
        const mockRemainingPot = 200; // Mock remaining pot
        const mockLivePhaseGold = Math.floor(mockRemainingPot / 2); // Split pot 50/50

        console.log('🎭 Using mock data for draw scenario:', {
          mockBlindPhaseGold,
          mockRemainingPot,
          mockLivePhaseGold
        });

        return {
          blindPhase: mockBlindPhaseGold,
          livePhase: mockLivePhaseGold,
          total: mockBlindPhaseGold + mockLivePhaseGold,
        };
      }
      return { blindPhase: 0, livePhase: 0, total: 0 };
    }

    const isWhite = blindResults.white_player_id === playerData.id;

    console.log('💰 Gold calculation logic:', {
      isWinner,
      isDraw,
      isWhite,
      winner: gameResult.winner,
      myColor,
      remaining_pot: blindResults.remaining_pot,
      white_player_id: blindResults.white_player_id,
      player_id: playerData.id
    });

    // Blind phase gold
    const blindPhaseGold = isWhite
      ? blindResults.white_total_gold
      : blindResults.black_total_gold;

    // Live phase gold
    let livePhaseGold = 0;
    if (isWinner) {
      livePhaseGold = blindResults.remaining_pot;
      console.log('🏆 Victory detected - awarding remaining pot:', livePhaseGold);
    } else if (isDraw) {
      livePhaseGold = Math.floor(blindResults.remaining_pot / 2);
      console.log('⚖️ Draw detected - splitting pot:', livePhaseGold);
    } else {
      console.log('💀 Defeat detected - no live phase gold');
    }

    const result = {
      blindPhase: blindPhaseGold,
      livePhase: livePhaseGold,
      total: blindPhaseGold + livePhaseGold,
    };

    console.log('💰 Final gold calculation result:', result);
    return result;
  };

  const resultInfo = getResultInfo();
  const goldEarned = calculateGoldEarned();
  const isWinner = gameResult.winner === myColor;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative max-w-md w-full mx-auto animate-scale-in">
        {/* Enhanced gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${resultInfo.bgColor} rounded-2xl blur-2xl opacity-60 animate-pulse scale-105`}
        />

        {/* Secondary glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />

        <Card className="relative bg-black/40 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          {/* Top-left logo watermark */}
          <div className="absolute top-4 left-4 z-10">
            <img
              src="/logo.png"
              alt="BlindBlitz"
              className="w-8 h-8 rounded-lg opacity-40 hover:opacity-60 transition-opacity"
            />
          </div>

          {/* Top-right close button */}
          <motion.button
            onClick={onClose}
            title="Close"
            variants={closeButtonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm border border-white/10 shadow-lg flex items-center justify-center transition-all duration-200 z-10"
          >
            <X size={16} color="white" />
          </motion.button>

          <div className="relative p-4">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="text-4xl mb-2 drop-shadow-lg animate-bounce">
                {resultInfo.icon}
              </div>
              <h1 className={`text-2xl font-black mb-1 tracking-wide ${resultInfo.textColor} drop-shadow-sm`}>
                {resultInfo.title}
              </h1>
              <p className="text-gray-200 text-sm font-medium">{resultInfo.subtitle}</p>
            </div>

            {/* Gold Breakdown */}
            {loading ? (
              <div className="bg-white/8 backdrop-blur-xl rounded-xl p-3 mb-4 border border-white/15">
                <div className="animate-pulse">
                  <div className="h-3 bg-gray-500/30 rounded mb-2"></div>
                  <div className="h-4 bg-gray-500/30 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="bg-white/8 backdrop-blur-xl rounded-xl p-3 mb-4 border border-white/15 shadow-lg">
                <h3 className="text-base font-bold text-white mb-3 text-center tracking-wide">
                  💰 Gold Summary
                </h3>

                <div className="space-y-2">
                  {blindResults?.game_mode === 'classic' && (
                    <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-white/5">
                      <span className="text-gray-200 text-sm font-medium">🧠 Blind Phase:</span>
                      <span
                        className={`font-bold text-base ${
                          goldEarned.blindPhase >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {goldEarned.blindPhase >= 0 ? '+' : ''}
                        {goldEarned.blindPhase} 💰
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-white/5">
                    <span className="text-gray-200 text-sm font-medium">
                      ⚔️ {gameResult.winner === 'draw'
                        ? 'Draw Split:'
                        : isWinner
                        ? 'Victory:'
                        : 'Battle:'}
                    </span>
                    <span
                      className={`font-bold text-base ${
                        goldEarned.livePhase > 0
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {goldEarned.livePhase > 0 ? '+' : ''}
                      {goldEarned.livePhase} 💰
                    </span>
                  </div>

                  <div className="border-t border-white/20 pt-2 mt-2">
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-400/20">
                      <span className="text-white font-bold text-base">
                        💰 Total:
                      </span>
                      <span className="text-2xl font-black text-yellow-400 drop-shadow-sm">
                        +{goldEarned.total} 💰
                      </span>
                    </div>
                  </div>
              </div>
            </div>
          )}

            {/* Modern Animated Action Buttons */}
            <div className="flex gap-2 justify-center">
              {onRematch && gameResult.type !== 'abandonment' && (
                <motion.button
                  onClick={() => {}} // Disabled functionality
                  title="Feature coming soon"
                  variants={rematchButtonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  disabled={true}
                  className="w-14 h-14 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold rounded-xl backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center transition-all duration-200 opacity-50 cursor-not-allowed"
                >
                  <RotateCcw size={20} color="white" />
                </motion.button>
              )}

              <motion.button
                onClick={onReturnToLobby}
                title="Return to Lobby"
                variants={homeButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center transition-all duration-200"
              >
                <Home size={20} color="white" />
              </motion.button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
