// screens/LandingPage.tsx - Create this new file
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
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
              <div className="text-4xl animate-pulse">♟️</div>
              <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-red-500 rounded-full"></div>
            </div>

            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed">
              Experience chess like never before! Make your moves blindly, then
              watch the
              <span className="text-yellow-400 font-semibold">
                {' '}
                chaos unfold
              </span>
              . Strategic planning meets unpredictable excitement.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">🕶️</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Blind Planning
              </h3>
              <p className="text-gray-400 text-sm">
                Make 5 moves without seeing your opponent's pieces. Pure
                strategy and intuition!
              </p>
            </div>

            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Epic Reveals
              </h3>
              <p className="text-gray-400 text-sm">
                Watch the battlefield transform as blind moves collide in
                spectacular fashion!
              </p>
            </div>

            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-red-500/30 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-xl font-bold text-white mb-2">Live Battle</h3>
              <p className="text-gray-400 text-sm">
                Continue the game with full vision. Adapt to the chaos and claim
                victory!
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/lobby"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 
                         text-white font-bold text-lg px-8 py-4 rounded-2xl 
                         transition-all duration-300 transform hover:scale-110 active:scale-95
                         shadow-2xl hover:shadow-blue-500/40 border border-blue-400/30
                         flex items-center space-x-3"
            >
              <span className="text-2xl group-hover:animate-bounce">🚀</span>
              <span>Play Now</span>
            </Link>

            <button
              onClick={() =>
                document
                  .getElementById('how-to-play')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="group bg-black/30 hover:bg-black/50 backdrop-blur-lg
                         text-white font-semibold text-lg px-8 py-4 rounded-2xl 
                         transition-all duration-300 transform hover:scale-105
                         border border-white/20 hover:border-white/40
                         flex items-center space-x-3"
            >
              <span className="text-2xl group-hover:animate-pulse">📖</span>
              <span>How to Play</span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-blue-400 mb-2">
                1.2K+
              </div>
              <div className="text-gray-400 text-sm">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-purple-400 mb-2">
                456
              </div>
              <div className="text-gray-400 text-sm">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-red-400 mb-2">
                98%
              </div>
              <div className="text-gray-400 text-sm">Mind Blown</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-yellow-400 mb-2">
                ∞
              </div>
              <div className="text-gray-400 text-sm">Fun Factor</div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section id="how-to-play" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              How to Play
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              BlindChess is a revolutionary twist on the classic game. Here's
              how the magic happens:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-lg rounded-3xl p-8 border border-blue-500/30 h-full">
                <div className="absolute -top-4 left-8 bg-blue-600 text-white font-black text-lg px-4 py-2 rounded-full">
                  Step 1
                </div>
                <div className="text-6xl mb-6 text-center">🕶️</div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Blind Phase
                </h3>
                <p className="text-gray-300 text-center mb-6">
                  Each player makes 5 moves without seeing their opponent's
                  pieces. Pure strategy and chess intuition!
                </p>
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">Rules:</div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Maximum 5 moves total</li>
                    <li>• Max 2 moves per piece</li>
                    <li>• 5 seconds per turn</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/30 h-full">
                <div className="absolute -top-4 left-8 bg-purple-600 text-white font-black text-lg px-4 py-2 rounded-full">
                  Step 2
                </div>
                <div className="text-6xl mb-6 text-center">🎬</div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  The Reveal
                </h3>
                <p className="text-gray-300 text-center mb-6">
                  Watch in amazement as the blind moves unfold! See how your
                  strategies collided in unexpected ways.
                </p>
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">Experience:</div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Cinematic move animation</li>
                    <li>• Real-time board evolution</li>
                    <li>• Epic moment of truth!</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 backdrop-blur-lg rounded-3xl p-8 border border-red-500/30 h-full">
                <div className="absolute -top-4 left-8 bg-red-600 text-white font-black text-lg px-4 py-2 rounded-full">
                  Step 3
                </div>
                <div className="text-6xl mb-6 text-center">⚔️</div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Live Battle
                </h3>
                <p className="text-gray-300 text-center mb-6">
                  Now you can see everything! Continue the game with full vision
                  and adapt to the new battlefield.
                </p>
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">Features:</div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 3+2 Blitz format</li>
                    <li>• Full chess rules</li>
                    <li>• Victory awaits!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Play Now CTA */}
          <div className="text-center mt-16">
            <Link
              to="/lobby"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 
                         text-white font-bold text-xl px-10 py-5 rounded-2xl 
                         transition-all duration-300 transform hover:scale-110 active:scale-95
                         shadow-2xl hover:shadow-green-500/40"
            >
              <span className="text-2xl">🎮</span>
              <span>Ready to Experience BlindChess?</span>
              <span className="text-2xl">🚀</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
