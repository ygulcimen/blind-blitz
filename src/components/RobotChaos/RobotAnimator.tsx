import React from 'react';

interface RobotAnimatorProps {
  status: 'thinking' | 'moving' | 'finished' | 'idle' | 'preparing';
  dialogue: string;
}

const RobotAnimator: React.FC<RobotAnimatorProps> = ({ status, dialogue }) => {
  const getRobotAnimation = () => {
    switch (status) {
      case 'thinking':
        return 'animate-spin';
      case 'moving':
        return 'animate-bounce scale-110';
      case 'finished':
        return 'animate-pulse scale-125';
      case 'preparing':
        return 'animate-ping';
      default:
        return 'hover:scale-105';
    }
  };

  const getRobotEmoji = () => {
    switch (status) {
      case 'thinking':
        return '🧠';
      case 'moving':
        return '⚡';
      case 'finished':
        return '🎉';
      case 'preparing':
        return '🔄';
      default:
        return '🤖';
    }
  };

  return (
    <div className="text-center mb-6">
      <div
        className={`text-8xl mb-4 transition-all duration-500 cursor-pointer ${getRobotAnimation()}`}
        style={{
          filter: status === 'moving' ? 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.7))' : '',
        }}
      >
        {getRobotEmoji()}
      </div>

      <div
        className={`px-4 py-2 rounded-lg border transition-all mb-4 ${
          status === 'thinking'
            ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400'
            : status === 'moving'
            ? 'bg-blue-900/30 border-blue-500/50 text-blue-400'
            : status === 'finished'
            ? 'bg-green-900/30 border-green-500/50 text-green-400'
            : status === 'preparing'
            ? 'bg-purple-900/30 border-purple-500/50 text-purple-400'
            : 'bg-gray-900/30 border-gray-500/50 text-gray-400'
        }`}
      >
        <div className="text-sm font-medium mb-1">
          {status === 'thinking' && 'CALCULATING CHAOS...'}
          {status === 'moving' && 'EXECUTING MAYHEM...'}
          {status === 'finished' && 'CHAOS COMPLETE!'}
          {status === 'preparing' && 'INITIALIZING CHAOS PROTOCOLS...'}
          {status === 'idle' && 'AWAITING ORDERS...'}
        </div>
      </div>

      {dialogue && (
        <div className="relative max-w-xs mx-auto">
          <div className="bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-lg border border-purple-500/50 rounded-2xl p-4 shadow-xl">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-purple-700/90"></div>
            <div className="text-sm text-purple-100 font-medium leading-relaxed italic animate-pulse">
              {dialogue}
            </div>
          </div>

          {(status === 'thinking' || status === 'preparing') && (
            <div className="flex justify-center mt-2 space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-0"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RobotAnimator;
