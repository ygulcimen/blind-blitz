// src/screens/LobbyPage/components/CreateRoomModal.tsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  Bot,
  Lock,
  Unlock,
  Info,
  Coins,
  Clock,
  Shield,
} from 'lucide-react';
import type { RoomConfig } from '../types/lobby.types';
import { useModal } from '../../../context/ModalContext';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (config: RoomConfig) => void;
  playerGold: number;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  onClose,
  onCreate,
  playerGold,
}) => {
  const [config, setConfig] = useState<RoomConfig>({
    mode: 'classic',
    timeControl: '10+5',
    entryFee: 100,
    isPrivate: false,
    ratingRestriction: 'any',
  });
  const { setModalOpen } = useModal();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const timeControls = [
    { value: '3+2', label: 'Blitz', category: 'Fast' },
    { value: '5+3', label: 'Blitz', category: 'Fast' },
    { value: '10+5', label: 'Rapid', category: 'Medium' },
    { value: '15+10', label: 'Rapid', category: 'Medium' },
    { value: '30+0', label: 'Classical', category: 'Slow' },
  ];

  const entryFees = [
    { value: 0, label: 'Free', color: 'text-gray-400' },
    { value: 50, label: '50g', color: 'text-white' },
    { value: 100, label: '100g', color: 'text-white' },
    { value: 200, label: '200g', color: 'text-yellow-400' },
    { value: 500, label: '500g', color: 'text-orange-400' },
    { value: 1000, label: '1000g', color: 'text-red-400' },
  ];

  const canAffordEntry = playerGold >= config.entryFee;
  const estimatedReward = config.entryFee * 1.8; // 90% return rate
  useEffect(() => {
    setModalOpen(true);
    document.body.style.overflow = 'hidden';

    return () => {
      setModalOpen(false);
      document.body.style.overflow = '';
    };
  }, [setModalOpen]);
  const handleCreate = () => {
    if (canAffordEntry) {
      onCreate(config);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Create Room</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Game Mode Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block flex items-center gap-2">
              Game Mode
              <Info className="w-4 h-4 text-gray-600" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfig({ ...config, mode: 'classic' })}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  config.mode === 'classic'
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <Eye
                  className={`w-6 h-6 mb-2 ${
                    config.mode === 'classic'
                      ? 'text-blue-400'
                      : 'text-gray-400'
                  }`}
                />
                <div
                  className={`font-semibold ${
                    config.mode === 'classic' ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  Classic Blind
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Traditional blind phase
                </div>
                {config.mode === 'classic' && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setConfig({ ...config, mode: 'robochaos' })}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  config.mode === 'robochaos'
                    ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <Bot
                  className={`w-6 h-6 mb-2 ${
                    config.mode === 'robochaos'
                      ? 'text-purple-400'
                      : 'text-gray-400'
                  }`}
                />
                <div
                  className={`font-semibold ${
                    config.mode === 'robochaos' ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  RoboChaos
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  AI-controlled chaos
                </div>
                {config.mode === 'robochaos' && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Time Control */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Control
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeControls.map((time) => (
                <button
                  key={time.value}
                  onClick={() =>
                    setConfig({ ...config, timeControl: time.value })
                  }
                  className={`p-2.5 rounded-lg border transition-all ${
                    config.timeControl === time.value
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium">{time.value}</div>
                  <div className="text-xs opacity-70">{time.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Entry Fee */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Entry Fee
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {entryFees.map((fee) => (
                <button
                  key={fee.value}
                  onClick={() => setConfig({ ...config, entryFee: fee.value })}
                  disabled={playerGold < fee.value}
                  className={`p-2.5 rounded-lg border transition-all ${
                    config.entryFee === fee.value
                      ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400'
                      : playerGold < fee.value
                      ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  } ${fee.color}`}
                >
                  {fee.label}
                </button>
              ))}
            </div>

            {/* Fee Info */}
            <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Your Balance</span>
                <span
                  className={`font-medium ${
                    canAffordEntry ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {playerGold}g
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Est. Winner Reward</span>
                <span className="text-yellow-400 font-medium">
                  ~{Math.round(estimatedReward)}g
                </span>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              {showAdvanced ? '▼' : '▶'} Advanced Settings
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {/* Private Room Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {config.isPrivate ? (
                      <Lock className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Unlock className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <div className="text-white font-medium">Private Room</div>
                      <div className="text-gray-500 text-xs">
                        Invite-only access
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setConfig({ ...config, isPrivate: !config.isPrivate })
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      config.isPrivate ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        config.isPrivate ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Rating Restriction */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Rating Restriction
                  </label>
                  <select
                    value={config.ratingRestriction}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        ratingRestriction: e.target.value,
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white"
                  >
                    <option value="any">Any Rating</option>
                    <option value="0-1200">Beginner (0-1200)</option>
                    <option value="1200-1500">Intermediate (1200-1500)</option>
                    <option value="1500-1800">Advanced (1500-1800)</option>
                    <option value="1800+">Master (1800+)</option>
                    <option value="similar">Similar to mine (±100)</option>
                  </select>
                </div>

                {/* Password (if private) */}
                {config.isPrivate && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Room Password (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Leave empty for no password"
                      value={config.password || ''}
                      onChange={(e) =>
                        setConfig({ ...config, password: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Room Summary</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white">
                {config.mode === 'robochaos' ? (
                  <>
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>RoboChaos Mode</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span>Classic Blind Mode</span>
                  </>
                )}
                <span className="text-gray-500">•</span>
                <span>{config.timeControl}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Entry: {config.entryFee}g</span>
                <span>•</span>
                <span>Win: ~{Math.round(estimatedReward)}g</span>
                {config.isPrivate && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-400">Private</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canAffordEntry}
            className={`flex-1 font-semibold py-3 rounded-xl transition-all ${
              canAffordEntry
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {canAffordEntry ? 'Create Room' : 'Insufficient Gold'}
          </button>
        </div>
      </div>
    </div>
  );
};
