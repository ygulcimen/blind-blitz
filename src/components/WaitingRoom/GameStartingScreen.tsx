// components/WaitingRoom/GameStartingScreen.tsx
import React from 'react';

interface GameStartingScreenProps {
  mode: 'classic' | 'robochaos';
  countdown: number;
}

export const GameStartingScreen: React.FC<GameStartingScreenProps> = ({
  mode,
  countdown,
}) => {
  const getModeConfig = (mode: 'classic' | 'robochaos') => {
    switch (mode) {
      case 'classic':
        return {
          name: 'Classic Blind',
          subtitle: 'First 5 moves in darkness',
          icon: '👁️‍🗨️',
          gradient: 'from-purple-700 via-indigo-600 to-blue-700',
          bgGradient: 'from-purple-900/20 via-indigo-900/10 to-blue-900/20',
          message: 'ENTER THE DARKNESS!',
        };
      case 'robochaos':
        return {
          name: 'RoboChaos',
          subtitle: 'AI trolls make your opening',
          icon: '🤖',
          gradient: 'from-red-600 via-orange-500 to-yellow-500',
          bgGradient: 'from-red-900/20 via-orange-900/10 to-yellow-900/20',
          message: 'ROBOTS ACTIVATED!',
        };
      default:
        return {
          name: 'Unknown Mode',
          subtitle: 'Unknown challenge awaits',
          icon: '❓',
          gradient: 'from-slate-500 to-slate-600',
          bgGradient: 'from-slate-900/20 to-slate-800/10',
          message: 'GAME STARTING!',
        };
    }
  };

  const modeConfig = getModeConfig(mode);

  return (
    <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${modeConfig.bgGradient} animate-pulse`}
        />
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-bounce" />
      </div>

      <div className="relative z-10 text-center">
        <div className="text-6xl mb-6 animate-bounce drop-shadow-2xl">
          {modeConfig.icon}
        </div>
        <h1 className="text-5xl font-black mb-3 tracking-wider">
          <span
            className={`bg-gradient-to-r ${modeConfig.gradient} bg-clip-text text-transparent animate-pulse`}
          >
            {modeConfig.message}
          </span>
        </h1>
        <p className="text-lg text-gray-300 mb-2">
          💰 Entry fees charged successfully!
        </p>
        <p className="text-lg text-gray-300 mb-5">Battle beginning in...</p>
        <div className="text-7xl font-black text-white animate-pulse drop-shadow-2xl">
          {countdown}
        </div>
      </div>
    </div>
  );
};
