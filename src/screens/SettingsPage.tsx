import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicVolume: 70,
    effectsVolume: 80,
    boardTheme: 'classic',
    pieceSet: 'traditional',
    animationsEnabled: true,
    autoPromoteQueen: true,
    showCoordinates: true,
    highlightMoves: true,
    blindTimer: 5,
    notifications: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const boardThemes = [
    { id: 'classic', name: 'Classic Brown', preview: '🟫' },
    { id: 'blue', name: 'Ocean Blue', preview: '🟦' },
    { id: 'green', name: 'Forest Green', preview: '🟩' },
    { id: 'purple', name: 'Royal Purple', preview: '🟪' },
  ];

  const pieceSets = [
    { id: 'traditional', name: 'Traditional', preview: '♔' },
    { id: 'modern', name: 'Modern', preview: '⭐' },
    { id: 'fantasy', name: 'Fantasy', preview: '🐉' },
  ];

  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Customize your BlindChess experience
          </p>
        </div>

        <div className="space-y-8">
          {/* Audio Settings */}
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">🔊</span>
              Audio Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Sound Effects</span>
                  <button
                    onClick={() =>
                      handleSettingChange(
                        'soundEnabled',
                        !settings.soundEnabled
                      )
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.soundEnabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.soundEnabled
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Music Volume</span>
                    <span className="text-white font-medium">
                      {settings.musicVolume}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume}
                    onChange={(e) =>
                      handleSettingChange(
                        'musicVolume',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Effects Volume</span>
                    <span className="text-white font-medium">
                      {settings.effectsVolume}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.effectsVolume}
                    onChange={(e) =>
                      handleSettingChange(
                        'effectsVolume',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visual Settings */}
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">🎨</span>
              Visual Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-3">Board Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {boardThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() =>
                        handleSettingChange('boardTheme', theme.id)
                      }
                      className={`p-3 rounded-lg border transition-all ${
                        settings.boardTheme === theme.id
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{theme.preview}</div>
                      <div className="text-sm text-gray-300">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-3">Piece Set</label>
                <div className="space-y-2">
                  {pieceSets.map((set) => (
                    <button
                      key={set.id}
                      onClick={() => handleSettingChange('pieceSet', set.id)}
                      className={`w-full p-3 rounded-lg border transition-all flex items-center space-x-3 ${
                        settings.pieceSet === set.id
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-2xl">{set.preview}</span>
                      <span className="text-gray-300">{set.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">⚙️</span>
              Game Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Show Coordinates</span>
                  <button
                    onClick={() =>
                      handleSettingChange(
                        'showCoordinates',
                        !settings.showCoordinates
                      )
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.showCoordinates ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.showCoordinates
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Highlight Legal Moves</span>
                  <button
                    onClick={() =>
                      handleSettingChange(
                        'highlightMoves',
                        !settings.highlightMoves
                      )
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.highlightMoves ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.highlightMoves
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Auto-promote to Queen</span>
                  <button
                    onClick={() =>
                      handleSettingChange(
                        'autoPromoteQueen',
                        !settings.autoPromoteQueen
                      )
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.autoPromoteQueen ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.autoPromoteQueen
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Blind Phase Timer</span>
                    <span className="text-white font-medium">
                      {settings.blindTimer}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={settings.blindTimer}
                    onChange={(e) =>
                      handleSettingChange(
                        'blindTimer',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Enable Animations</span>
                  <button
                    onClick={() =>
                      handleSettingChange(
                        'animationsEnabled',
                        !settings.animationsEnabled
                      )
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.animationsEnabled
                        ? 'bg-green-600'
                        : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.animationsEnabled
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="text-center">
            <button
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 
                               text-white font-bold text-lg px-8 py-4 rounded-2xl 
                               transition-all duration-300 transform hover:scale-110 active:scale-95
                               shadow-2xl hover:shadow-green-500/40"
            >
              💾 Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
