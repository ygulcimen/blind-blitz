import React from 'react';

interface RobotStatusPanelProps {
  status: 'thinking' | 'moving' | 'finished' | 'idle' | 'preparing';
  moveCount: number;
  onSkip?: () => void;
}

const RobotStatusPanel: React.FC<RobotStatusPanelProps> = ({
  status,
  moveCount,
  onSkip,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'thinking':
        return 'yellow';
      case 'moving':
        return 'blue';
      case 'finished':
        return 'green';
      case 'preparing':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'thinking':
        return 'Robot is calculating chaos parameters...';
      case 'moving':
        return 'Executing chaotic mayhem!';
      case 'finished':
        return 'Chaos sequence complete! Proceeding to reveal...';
      case 'preparing':
        return 'Warming up chaos engines...';
      default:
        return 'Robot standing by for next move...';
    }
  };

  const color = getStatusColor();
  const bgClass = `bg-${color}-900/20`;
  const borderClass = `border-${color}-500/30`;
  const textClass = `text-${color}-400`;

  return (
    <div className="space-y-3">
      {/* Progress Card */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border-2 border-purple-500/50 rounded-xl p-4 shadow-2xl shadow-purple-500/20">
        <div className="text-purple-300 font-bold text-sm mb-3 text-center">
          🤖 Robot Control Active
        </div>

        <div className="text-purple-400 font-bold text-center mb-3">
          {moveCount}/5 moves completed
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out shadow-lg shadow-purple-500/50"
            style={{ width: `${(moveCount / 5) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-purple-400 text-center font-medium">
          {Math.round((moveCount / 5) * 100)}% Complete
        </div>
      </div>

      {/* Controls Card */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border-2 border-purple-500/50 rounded-xl p-4 shadow-2xl shadow-purple-500/20">
        {status === 'finished' ? (
          <div className="text-center">
            <div className="text-green-400 font-bold text-sm mb-2">
              ✅ Chaos Complete!
            </div>
            <div className="text-green-300 text-xs">
              Preparing reveal phase...
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="text-purple-300 text-xs">
              Sit back and enjoy the chaos!
            </div>

            {/* Animated dots */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-0"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            </div>

            {/* Skip Animation Button */}
            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-gray-500/50 rounded-lg text-gray-200 hover:text-white text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
              >
                ⏭️ Skip Animation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RobotStatusPanel;
