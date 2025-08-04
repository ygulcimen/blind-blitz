import React from 'react';

interface RobotStatusPanelProps {
  status: 'thinking' | 'moving' | 'finished' | 'idle' | 'preparing';
  moveCount: number;
}

const RobotStatusPanel: React.FC<RobotStatusPanelProps> = ({
  status,
  moveCount,
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
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 text-center">
        <div className="text-purple-400 font-bold text-sm mb-2">
          🤖 Robot Control Active
        </div>
        <div className="text-purple-300 text-xs">
          Sit back and enjoy the chaos! You have no control here.
        </div>
        <div className="mt-2 text-purple-400 font-bold">
          {moveCount}/5 moves completed
        </div>
      </div>

      <div
        className={`${bgClass} border ${borderClass} rounded-xl p-4 text-center`}
      >
        <div className={`${textClass} font-bold text-sm mb-2`}>
          {status === 'thinking' && '🧠 THINKING'}
          {status === 'moving' && '⚡ MOVING'}
          {status === 'finished' && '✅ COMPLETE'}
          {status === 'preparing' && '🔄 PREPARING'}
          {status === 'idle' && '💤 IDLE'}
        </div>
        <div className={`${textClass.replace('400', '300')} text-xs`}>
          {getStatusMessage()}
        </div>
      </div>

      {status === 'finished' && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-green-400 font-bold text-sm mb-2">
            🎉 Robots Complete!
          </div>
          <div className="text-green-300 text-xs">
            Get ready for the epic reveal of robot chaos!
          </div>
        </div>
      )}

      {(status === 'thinking' || status === 'moving') && (
        <div className="text-center">
          <div className="flex justify-center space-x-1">
            <div
              className={`w-2 h-2 bg-${color}-400 rounded-full animate-bounce delay-0`}
            ></div>
            <div
              className={`w-2 h-2 bg-${color}-400 rounded-full animate-bounce delay-100`}
            ></div>
            <div
              className={`w-2 h-2 bg-${color}-400 rounded-full animate-bounce delay-200`}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RobotStatusPanel;
