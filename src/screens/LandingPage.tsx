// screens/LandingPage.tsx - ECONOMIC REVOLUTION VERSION
import React from 'react';
import { Link } from 'react-router-dom';
import { usePlayerEconomy } from '../context/PlayerEconomyConcept';

const LandingPage: React.FC = () => {
  const { state: economy } = usePlayerEconomy();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Chess Pieces Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl opacity-10 animate-bounce delay-1000">
            ♜
          </div>
          <div className="absolute top-40 right-20 text-8xl opacity-10 animate-pulse delay-2000">
            ♛
          </div>
          <div className="absolute bottom-32 left-1/4 text-7xl opacity-10 animate-bounce delay-500">
            ♞
          </div>
          <div className="absolute bottom-20 right-1/3 text-5xl opacity-10 animate-pulse delay-1500">
            ♝
          </div>
          <div className="absolute top-1/3 left-1/2 text-4xl opacity-10 animate-bounce delay-3000">
            ♟
          </div>
          {/* Gold coins floating */}
          <div className="absolute top-1/4 right-10 text-4xl opacity-20 animate-pulse delay-2500">
            🪙
          </div>
          <div className="absolute bottom-1/4 left-20 text-3xl opacity-15 animate-bounce delay-3500">
            💰
          </div>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Main Headline */}
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
                BLIND
              </span>
              <br />
              <span className="text-white">CHESS</span>
            </h1>

            <div className="flex justify-center items-center space-x-4 mb-6">
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <div className="text-4xl animate-pulse">💰</div>
              <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-red-500 rounded-full"></div>
            </div>

            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed mb-4">
              The world's first{' '}
              <span className="text-yellow-400 font-semibold">
                economic chess battleground
              </span>
              ! Every move costs gold, every game is a financial risk.
            </p>

            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              No free games. No participation trophies.
              <span className="text-red-400 font-bold">
                {' '}
                Pure financial warfare.
              </span>
            </p>
          </div>

          {/* Revolutionary Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-xl font-bold text-red-400 mb-2">
                No Free Gold
              </h3>
              <p className="text-gray-400 text-sm">
                Start with 1000 gold. Spend wisely or face bankruptcy and
                account deletion!
              </p>
            </div>

            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">
                Banking System
              </h3>
              <p className="text-gray-400 text-sm">
                Borrow gold with daily interest. Manage debt carefully or lose
                everything!
              </p>
            </div>

            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-xl font-bold text-green-400 mb-2">
                Winner Takes All
              </h3>
              <p className="text-gray-400 text-sm">
                Entry fees create prize pools. Victory means profit, defeat
                means financial loss!
              </p>
            </div>
          </div>

          {/* Game Modes */}
          <div className="mb-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              Choose Your Financial Weapon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6 hover:bg-blue-900/30 transition-all">
                <div className="text-5xl mb-4">🕶️</div>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">
                  Classic Blind Mode
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  You control your 5 blind moves. Pure strategy meets financial
                  risk.
                </p>
                <div className="bg-blue-800/20 rounded-lg p-3">
                  <div className="text-blue-300 text-xs">
                    • 5 moves blindly planned by you
                    <br />
                    • Epic reveal of collision
                    <br />
                    • Live chess battle finale
                    <br />•{' '}
                    <span className="text-yellow-400">
                      Entry fees: 25-500 gold
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 hover:bg-purple-900/30 transition-all">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-purple-400 mb-3">
                  Robot Chaos Mode
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  AI robots make hilarious random moves while trolling you!
                </p>
                <div className="bg-purple-800/20 rounded-lg p-3">
                  <div className="text-purple-300 text-xs">
                    • Robots control blind phase
                    <br />
                    • Sassy AI commentary
                    <br />
                    • "This is how I play in 5D!"
                    <br />•{' '}
                    <span className="text-yellow-400">
                      Higher stakes, more chaos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Economic Warning */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 mb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-xl font-bold text-red-400">
                Economic Reality Check
              </h3>
              <span className="text-3xl">⚠️</span>
            </div>
            <div className="text-gray-300 text-sm space-y-2">
              <p>
                • <strong>Every game costs gold</strong> - No free entertainment
                here
              </p>
              <p>
                • <strong>Bankruptcy = Account deletion</strong> - Manage your
                finances wisely
              </p>
              <p>
                • <strong>Limited daily gold mining</strong> - Only 2-3 skill
                puzzles per day
              </p>
              <p>
                • <strong>Banking has interest</strong> - Debt grows daily at
                15% rate
              </p>
              <p className="text-yellow-400 font-semibold">
                This isn't your typical chess app. This is financial survival.
              </p>
            </div>
          </div>

          {/* Current Player Status */}
          {economy.gold > 0 && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 mb-8 max-w-md mx-auto">
              <div className="text-green-400 font-bold mb-2">
                💰 Your Financial Status
              </div>
              <div className="text-2xl font-black text-yellow-400">
                {economy.gold} GOLD
              </div>
              <div className="text-green-300 text-sm">
                Ready for economic warfare!
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/lobby"
              className="group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 
                         text-white font-bold text-lg px-8 py-4 rounded-2xl 
                         transition-all duration-300 transform hover:scale-110 active:scale-95
                         shadow-2xl hover:shadow-red-500/40 border border-red-400/30
                         flex items-center space-x-3"
            >
              <span className="text-2xl group-hover:animate-bounce">💀</span>
              <span>Enter the Battleground</span>
            </Link>

            <button
              onClick={() =>
                document
                  .getElementById('economic-reality')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="group bg-black/30 hover:bg-black/50 backdrop-blur-lg
                         text-white font-semibold text-lg px-8 py-4 rounded-2xl 
                         transition-all duration-300 transform hover:scale-105
                         border border-white/20 hover:border-white/40
                         flex items-center space-x-3"
            >
              <span className="text-2xl group-hover:animate-pulse">⚠️</span>
              <span>Economic Rules</span>
            </button>
          </div>

          {/* Intimidating Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-red-400 mb-2">
                47%
              </div>
              <div className="text-gray-400 text-sm">Bankruptcy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-yellow-400 mb-2">
                1.2M
              </div>
              <div className="text-gray-400 text-sm">Gold Lost Daily</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-green-400 mb-2">
                156
              </div>
              <div className="text-gray-400 text-sm">Deleted Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-purple-400 mb-2">
                15%
              </div>
              <div className="text-gray-400 text-sm">Daily Interest</div>
            </div>
          </div>
        </div>
      </section>

      {/* Economic Reality Section */}
      <section id="economic-reality" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              <span className="text-red-400">Economic</span> Warfare Rules
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              This isn't a game. This is a financial survival simulator
              disguised as chess.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rule 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 backdrop-blur-lg rounded-3xl p-8 border border-red-500/30 h-full">
                <div className="absolute -top-4 left-8 bg-red-600 text-white font-black text-lg px-4 py-2 rounded-full">
                  Rule 1
                </div>
                <div className="text-6xl mb-6 text-center">💸</div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  No Free Gold
                </h3>
                <p className="text-gray-300 text-center mb-6">
                  Every single game costs gold. No freebies, no charity, no
                  exceptions. Welcome to economic reality.
                </p>
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Consequences:
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Entry fees: 25-500 gold</li>
                    <li>• No participation rewards</li>
                    <li>• Winner takes everything</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-900/30 to-orange-800/30 backdrop-blur-lg rounded-3xl p-8 border border-yellow-500/30 h-full">
                <div className="absolute -top-4 left-8 bg-yellow-600 text-white font-black text-lg px-4 py-2 rounded-full">
                  Rule 2
                </div>
                <div className="text-6xl mb-6 text-center">🏦</div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Banking = Survival
                </h3>
                <p className="text-gray-300 text-center mb-6">
                  Out of gold? Borrow from our bank. But remember: 15% daily
                  interest will crush you if you're not careful.
                </p>
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Banking Terms:
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 15% daily interest rate</li>
                    <li>• Max debt: 500 gold</li>
                    <li>• Default = Account deletion</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/30 h-full">
                <div className="absolute -top-4 left-8 bg-purple-600 text-white font-black text-lg px-4 py-2 rounded-full">
                  Rule 3
                </div>
                <div className="text-6xl mb-6 text-center">💀</div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Bankruptcy = Death
                </h3>
                <p className="text-gray-300 text-center mb-6">
                  Reach maximum debt? Your account gets permanently deleted. No
                  appeals, no mercy, no second chances.
                </p>
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Final Warning:
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Account deletion is permanent</li>
                    <li>• All progress lost forever</li>
                    <li>• Start over from zero</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Still Think You Can Handle It?
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Most players lose their entire fortune within the first week.
                The question isn't whether you can play chess...
                <span className="text-red-400 font-bold">
                  {' '}
                  it's whether you can survive economically.
                </span>
              </p>
            </div>

            <Link
              to="/lobby"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-500 hover:via-orange-500 hover:to-yellow-500 
                         text-white font-bold text-xl px-10 py-5 rounded-2xl 
                         transition-all duration-300 transform hover:scale-110 active:scale-95
                         shadow-2xl hover:shadow-orange-500/40"
            >
              <span className="text-2xl">💀</span>
              <span>Risk Everything Now</span>
              <span className="text-2xl">💰</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
