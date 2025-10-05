// src/components/landingPage/GameModes.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameModes: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'classical' | 'robochaos'>(
    'classical'
  );
  const navigate = useNavigate();

  const handleChooseMode = () => {
    // Navigate to games page with selected mode as query parameter
    navigate(`/games?mode=${selectedMode}`);
  };

  const handlePlayMode = (mode: 'classical' | 'robochaos') => {
    navigate(`/games?mode=${mode}&quickStart=true`);
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Floating UI Elements */}

      {/* Left Side - Mode Comparison Chart */}
      <div className="absolute left-8 top-1/4 w-80 opacity-15 hover:opacity-25 transition-opacity duration-500">
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-white font-medium mb-4">Mode Statistics</div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Classical Wins</span>
                <span className="text-blue-400">847</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: '68%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">RoboChaos Wins</span>
                <span className="text-purple-400">423</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: '32%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Live Tournaments */}
      <div className="absolute right-8 top-1/3 w-72 opacity-15 hover:opacity-25 transition-opacity duration-500">
        <div className="bg-gray-900/40 border border-gray-700/40 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-white font-medium mb-4">Live Tournaments</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-white">Weekend Blitz</div>
                <div className="text-xs text-gray-400">Prize: 🪙 50K</div>
              </div>
              <div className="text-green-400 text-xs">LIVE</div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-white">Chaos Masters</div>
                <div className="text-xs text-gray-400">Prize: 🪙 100K</div>
              </div>
              <div className="text-yellow-400 text-xs">2h left</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-gray-400 text-sm">
              Choose your battlefield
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            Master Different
            <br />
            <span className="text-gray-400">Game Modes</span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Each mode tests different skills. Classical rewards strategic
            thinking, while RoboChaos demands rapid adaptation to unpredictable
            chaos.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-1 backdrop-blur-sm">
            <button
              onClick={() => setSelectedMode('classical')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                selectedMode === 'classical'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Classical Blind
            </button>
            <button
              onClick={() => setSelectedMode('robochaos')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                selectedMode === 'robochaos'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              RoboChaos
            </button>
          </div>
        </div>

        {/* Mode Details */}
        <div className="max-w-4xl mx-auto">
          {selectedMode === 'classical' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Classical Blind Chess
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Pure strategic warfare. Both players commit 5 moves blindly,
                    then the board reveals for standard chess combat. Rewards
                    planning, prediction, and classical chess mastery.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">
                      Strategic blind phase planning
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">
                      Standard chess after reveal
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">
                      Bonus gold for accurate predictions
                    </span>
                  </div>
                </div>

                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-400 text-sm">Entry Fee</div>
                      <div className="text-white font-semibold">100 🪙</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">Win Reward</div>
                      <div className="text-green-400 font-semibold">
                        300 🪙
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Play Button */}
                <button
                  onClick={() => handlePlayMode('classical')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Play Classical Now
                </button>
              </div>

              <div className="bg-gray-900/30 border border-gray-700/50 rounded-2xl p-6">
                <div className="grid grid-cols-8 gap-1 mb-4">
                  {Array.from({ length: 64 }, (_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm ${
                        (Math.floor(i / 8) + i) % 2 === 0
                          ? 'bg-gray-600/40'
                          : 'bg-gray-800/40'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-semibold mb-1">
                    Strategic Depth
                  </div>
                  <div className="text-gray-400 text-sm">
                    Classic chess mastery meets blind intuition
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMode === 'robochaos' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    RoboChaos Mode
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Embrace the madness. Our AI makes chaotic opening moves for
                    both sides, destroying traditional strategy. Adapt quickly
                    or face defeat in this high-stakes chaos arena.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">
                      AI-generated chaotic openings
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">
                      Rapid adaptation required
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">
                      Massive multiplier rewards
                    </span>
                  </div>
                </div>

                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-400 text-sm">Entry Fee</div>
                      <div className="text-white font-semibold">200 🪙</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">Win Reward</div>
                      <div className="text-yellow-400 font-semibold">
                        Up to 2000 🪙
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Play Button */}
                <button
                  onClick={() => handlePlayMode('robochaos')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Play RoboChaos Now
                </button>
              </div>

              <div className="bg-gray-900/30 border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden">
                {/* Chaos particles */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-purple-400/60 rounded-full animate-ping"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${10 + i * 20}%`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                ))}

                <div className="grid grid-cols-8 gap-1 mb-4 relative z-10">
                  {Array.from({ length: 64 }, (_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm transition-colors duration-1000 ${
                        (Math.floor(i / 8) + i) % 2 === 0
                          ? 'bg-gray-600/40 hover:bg-purple-500/20'
                          : 'bg-gray-800/40 hover:bg-purple-500/20'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-center relative z-10">
                  <div className="text-purple-400 font-semibold mb-1">
                    Controlled Chaos
                  </div>
                  <div className="text-gray-400 text-sm">
                    AI madness meets human adaptation
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            onClick={handleChooseMode}
            className="bg-white text-black font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors hover:scale-105 transform transition-transform duration-200"
          >
            Choose Your Mode
          </button>
        </div>
      </div>
    </section>
  );
};

export default GameModes;
