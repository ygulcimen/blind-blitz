// components/AnimatedReveal/components/SimpleRevealPanel.tsx
import React from 'react';
import { Star, Target, CheckCircle, XCircle } from 'lucide-react';

interface PlayerInfo {
  white: { name: string; rating: number };
  black: { name: string; rating: number };
}

interface CurrentMove {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
}

interface ModeInfo {
  name: string;
  subtitle: string;
  icon: string;
  gradient: string;
}

interface SimpleRevealPanelProps {
  playerInfo: PlayerInfo;
  myColor: 'white' | 'black' | null;
  gameMode: 'classic' | 'robot_chaos';
  modeInfo: ModeInfo;
  currentMove: CurrentMove | null;
  isStarting: boolean;
  moveLog: any[];
}

export const SimpleRevealPanel: React.FC<SimpleRevealPanelProps> = ({
  playerInfo,
  myColor,
  gameMode,
  modeInfo,
  currentMove,
  isStarting,
  moveLog,
}) => {
  // Calculate valid moves per player
  const whiteValidMoves = moveLog.filter(
    (m) => m.player === 'P1' && !m.isInvalid
  ).length;
  const blackValidMoves = moveLog.filter(
    (m) => m.player === 'P2' && !m.isInvalid
  ).length;
  const whiteTotalMoves = moveLog.filter((m) => m.player === 'P1').length;
  const blackTotalMoves = moveLog.filter((m) => m.player === 'P2').length;

  return (
    <div className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Mode Header */}
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-xl">{modeInfo.icon}</div>
            <div>
              <h1
                className={`text-sm font-black bg-gradient-to-r ${modeInfo.gradient} bg-clip-text text-transparent`}
              >
                {modeInfo.name}
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                {modeInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Simple Players */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider text-center">
            Warriors
          </h3>

          <div className="space-y-2">
            {/* White Player */}
            <div
              className={`flex items-center justify-between p-2 rounded-lg border ${
                myColor === 'white'
                  ? 'border-yellow-400/50 bg-yellow-500/10'
                  : 'border-blue-500/30 bg-blue-900/20'
              } backdrop-blur-sm`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {playerInfo.white.name[0] || 'W'}
                  </span>
                </div>
                <div>
                  <div className="text-white font-bold text-xs">
                    {playerInfo.white.name.split(' ')[0]}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-400 text-xs">
                      {playerInfo.white.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 font-bold text-sm">
                    {whiteValidMoves}/{whiteTotalMoves}
                  </span>
                </div>
                <div className="text-xs text-gray-400">Valid</div>
              </div>
            </div>

            {/* Black Player */}
            <div
              className={`flex items-center justify-between p-2 rounded-lg border ${
                myColor === 'black'
                  ? 'border-yellow-400/50 bg-yellow-500/10'
                  : gameMode === 'robot_chaos'
                  ? 'border-purple-500/30 bg-purple-900/20'
                  : 'border-gray-500/30 bg-gray-900/20'
              } backdrop-blur-sm`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center ${
                    gameMode === 'robot_chaos' ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span className="text-white font-bold text-xs">
                    {gameMode === 'robot_chaos'
                      ? '🤖'
                      : playerInfo.black.name[0] || 'B'}
                  </span>
                </div>
                <div>
                  <div className="text-white font-bold text-xs">
                    {playerInfo.black.name.split(' ')[0]}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-400 text-xs">
                      {playerInfo.black.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 font-bold text-sm">
                    {blackValidMoves}/{blackTotalMoves}
                  </span>
                </div>
                <div className="text-xs text-gray-400">Valid</div>
              </div>
            </div>
          </div>

          {/* "You" indicator */}
        </div>

        {/* Current Strike */}
        {currentMove && !isStarting && (
          <div className="mb-4">
            <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border border-orange-500/50 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-orange-400 font-bold text-xs mb-1 flex items-center justify-center gap-1">
                  <Target className="w-3 h-3" />
                  CURRENT STRIKE
                </div>
                <div
                  className={`text-2xl font-black mb-1 ${
                    currentMove.isInvalid
                      ? 'text-red-400 line-through'
                      : 'text-orange-300'
                  }`}
                >
                  {currentMove.san}
                </div>
                <div className="text-xs text-gray-300">
                  {currentMove.player === 'P1' ? 'White' : 'Black'} • Move
                </div>
                {currentMove.isInvalid && (
                  <div className="flex items-center justify-center gap-1 text-red-400 text-xs mt-1">
                    <XCircle className="w-2 h-2" />
                    <span>INVALID</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Simple Stats Summary */}
        <div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-3 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white mb-2 text-center">
              Battle Summary
            </h3>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-blue-900/30 rounded-lg p-2 border border-blue-700/30">
                <div className="text-blue-400 font-black text-lg">
                  {whiteValidMoves}
                </div>
                <div className="text-blue-300 text-xs font-medium">
                  White Valid
                </div>
              </div>

              <div className="bg-gray-900/30 rounded-lg p-2 border border-gray-700/30">
                <div className="text-gray-300 font-black text-lg">
                  {blackValidMoves}
                </div>
                <div className="text-gray-300 text-xs font-medium">
                  Black Valid
                </div>
              </div>
            </div>

            <div className="mt-2 text-center">
              <div className="text-xs text-gray-400">
                Total: {moveLog.length} moves
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isStarting && (
          <div className="mt-6 text-center">
            <div className="bg-gray-900/50 border border-gray-600/50 rounded-lg p-3">
              <div className="text-gray-300 text-sm mb-2">
                Analyzing moves...
              </div>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-0" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
