// src/screens/LobbyPage/components/ModeToggle.tsx - Clean Version
import React from 'react';
import { Eye, Bot } from 'lucide-react';

interface ModeToggleProps {
  selectedMode: 'classic' | 'robochaos';
  onModeChange: (mode: 'classic' | 'robochaos') => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
  selectedMode,
  onModeChange,
}) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative bg-gray-900/80 backdrop-blur-sm p-1 rounded-2xl border border-gray-700/50">
        {/* Sliding background */}
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-out ${
            selectedMode === 'classic'
              ? 'left-1 bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg'
              : 'left-[calc(50%+2px)] bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
          }`}
        />

        <div className="relative flex">
          {/* Classic Button */}
          <button
            onClick={() => onModeChange('classic')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 relative z-10 min-w-[160px] justify-center ${
              selectedMode === 'classic'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Eye className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm whitespace-nowrap">
              Classic Blind
            </span>
          </button>

          {/* RoboChaos Button */}
          <button
            onClick={() => onModeChange('robochaos')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 relative z-10 min-w-[160px] justify-center ${
              selectedMode === 'robochaos'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Bot className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm whitespace-nowrap">
              RoboChaos
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
