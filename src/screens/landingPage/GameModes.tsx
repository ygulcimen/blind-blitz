// src/components/landingPage/GameModes.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GameModes: React.FC = () => {
  const { t } = useTranslation();
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
    <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Floating UI Elements - Hidden on mobile */}

      {/* Left Side - Mode Comparison Chart */}
      <div className="hidden xl:block absolute left-8 top-1/4 w-80 opacity-15 hover:opacity-25 transition-opacity duration-500">
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
      <div className="hidden xl:block absolute right-8 top-1/3 w-72 opacity-15 hover:opacity-25 transition-opacity duration-500">
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header - Mobile Responsive */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
            <span className="text-gray-400 text-xs sm:text-sm">
              {t('landing.modes.sectionLabel')}
            </span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight">
            {t('landing.modes.title')}
            <br />
            <span className="text-gray-400">{t('landing.modes.titleHighlight')}</span>
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto px-4">
            {t('landing.modes.description')}
          </p>
        </div>

        {/* Mode Selector - Mobile Responsive */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-1 backdrop-blur-sm w-full sm:w-auto max-w-md">
            <button
              onClick={() => setSelectedMode('classical')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 w-1/2 sm:w-auto ${
                selectedMode === 'classical'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('landing.modes.tabClassical')}
            </button>
            <button
              onClick={() => setSelectedMode('robochaos')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 w-1/2 sm:w-auto ${
                selectedMode === 'robochaos'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('landing.modes.tabRoboChaos')}
            </button>
          </div>
        </div>

        {/* Mode Details - Mobile Responsive */}
        <div className="max-w-4xl mx-auto">
          {selectedMode === 'classical' && (
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                    {t('landing.modes.classical.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                    {t('landing.modes.classical.description')}
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <span className="text-sm sm:text-base text-gray-300">
                      {t('landing.modes.classical.feature1')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <span className="text-sm sm:text-base text-gray-300">
                      {t('landing.modes.classical.feature2')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <span className="text-sm sm:text-base text-gray-300">
                      {t('landing.modes.classical.feature3')}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-400 text-xs sm:text-sm">{t('landing.modes.classical.entryFee')}</div>
                      <div className="text-white text-sm sm:text-base font-semibold">100 🪙</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-xs sm:text-sm">{t('landing.modes.classical.winReward')}</div>
                      <div className="text-green-400 text-sm sm:text-base font-semibold">
                        300 🪙
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Play Button */}
                <button
                  onClick={() => handlePlayMode('classical')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold py-2.5 sm:py-3 rounded-lg transition-colors"
                >
                  {t('landing.modes.classical.playNow')}
                </button>
              </div>

              <div className="bg-gray-900/30 border border-gray-700/50 rounded-2xl p-4 sm:p-6">
                <div className="grid grid-cols-8 gap-0.5 sm:gap-1 mb-3 sm:mb-4">
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
                  <div className="text-blue-400 text-sm sm:text-base font-semibold mb-1">
                    {t('landing.modes.classical.cardTitle')}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {t('landing.modes.classical.cardDescription')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMode === 'robochaos' && (
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                    {t('landing.modes.roboChaos.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                    {t('landing.modes.roboChaos.description')}
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                    <span className="text-sm sm:text-base text-gray-300">
                      {t('landing.modes.roboChaos.feature1')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                    <span className="text-sm sm:text-base text-gray-300">
                      {t('landing.modes.roboChaos.feature2')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                    <span className="text-sm sm:text-base text-gray-300">
                      {t('landing.modes.roboChaos.feature3')}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-400 text-xs sm:text-sm">{t('landing.modes.roboChaos.entryFee')}</div>
                      <div className="text-white text-sm sm:text-base font-semibold">200 🪙</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-xs sm:text-sm">{t('landing.modes.roboChaos.winReward')}</div>
                      <div className="text-yellow-400 text-sm sm:text-base font-semibold">
                        {t('landing.modes.roboChaos.winRewardValue')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Play Button */}
                <button
                  onClick={() => handlePlayMode('robochaos')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base font-semibold py-2.5 sm:py-3 rounded-lg transition-colors"
                >
                  {t('landing.modes.roboChaos.playNow')}
                </button>
              </div>

              <div className="bg-gray-900/30 border border-gray-700/50 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                {/* Chaos particles */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400/60 rounded-full animate-ping"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${10 + i * 20}%`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                ))}

                <div className="grid grid-cols-8 gap-0.5 sm:gap-1 mb-3 sm:mb-4 relative z-10">
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
                  <div className="text-purple-400 text-sm sm:text-base font-semibold mb-1">
                    {t('landing.modes.roboChaos.cardTitle')}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {t('landing.modes.roboChaos.cardDescription')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA - Mobile Responsive */}
        <div className="text-center mt-10 sm:mt-12 md:mt-16">
          <button
            onClick={handleChooseMode}
            className="bg-white text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg hover:bg-gray-100 transition-colors hover:scale-105 transform transition-transform duration-200"
          >
            {t('landing.modes.ctaButton')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default GameModes;
