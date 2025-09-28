import React from 'react';
import { Card } from '../../ui/card';

interface PhaseTimelineProps {
  className?: string;
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({
  className = '',
}) => {
  const phases = [
    { name: 'Blind', icon: '🔘', completed: true },
    { name: 'Reveal', icon: '👁️', completed: true },
    { name: 'LIVE', icon: '⚔️', active: true }
  ];

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-white mb-3">🎮 Game Progress</h3>

      <div className="flex items-center justify-between">
        {phases.map((phase, index) => (
          <React.Fragment key={phase.name}>
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 transition-all duration-500 ${
                phase.active
                  ? 'bg-blue-500 text-white ring-2 ring-blue-300 animate-pulse shadow-lg shadow-blue-500/50'
                  : phase.completed
                  ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {phase.icon}
              </div>

              {/* Label */}
              <span className={`text-xs font-medium ${
                phase.active
                  ? 'text-blue-300'
                  : phase.completed
                  ? 'text-green-300'
                  : 'text-gray-400'
              }`}>
                {phase.name}
              </span>
            </div>

            {/* Connector Line */}
            {index < phases.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                phases[index + 1].completed || phases[index + 1].active
                  ? 'bg-green-500'
                  : 'bg-gray-600'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};