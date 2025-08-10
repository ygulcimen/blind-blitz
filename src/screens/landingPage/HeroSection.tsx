// src/components/landingPage/HeroSection.tsx
import React, { useState, useEffect } from 'react';

const HeroSection: React.FC = () => {
  const [robotMessage, setRobotMessage] = useState("I'll ruin your opening...");

  useEffect(() => {
    const messages = [
      "I'll ruin your opening...",
      'Random moves incoming!',
      'Chaos is my strategy 🤖',
      'Good luck, human!',
      'Preparing maximum trolling...',
    ];

    const interval = setInterval(() => {
      setRobotMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Giant King Silhouette - Left (scaled + responsive) */}
      <div className="absolute left-12 top-1/2 transform -translate-y-1/2 opacity-5">
        <div
          className="text-white"
          style={{
            fontSize: '16rem', // slightly smaller default
          }}
        >
          ♔
        </div>
      </div>

      {/* Giant Queen Silhouette - Right (scaled + responsive) */}
      <div className="absolute right-12 top-1/2 transform -translate-y-1/2 opacity-4">
        <div
          className="text-white"
          style={{
            fontSize: '10rem', // smaller to match king’s dominance
          }}
        >
          ♕
        </div>
      </div>

      {/* Floating Chess Pieces */}
      <div className="absolute bottom-32 right-1/3 opacity-6">
        <div
          className="text-5xl text-white animate-pulse"
          style={{ animationDuration: '5s' }}
        >
          ♗
        </div>
      </div>

      <div className="absolute top-1/3 right-20 opacity-7">
        <div
          className="text-4xl text-white animate-pulse"
          style={{ animationDuration: '3s' }}
        >
          ♜
        </div>
      </div>

      {/* Blindfold Symbol - Top Left */}
      <div className="absolute top-24 left-16 opacity-15">
        <div className="text-6xl">🕶️</div>
      </div>

      {/* Trolling AI Robot */}
      <div className="absolute bottom-32 left-12 opacity-30 hover:opacity-50 transition-opacity duration-500">
        <div className="relative">
          <div
            className="text-7xl animate-bounce"
            style={{ animationDuration: '2s' }}
          >
            🤖
          </div>
          <div className="absolute bottom-16 left-12 bg-gray-800 text-white text-sm px-4 py-3 rounded-lg whitespace-nowrap">
            {robotMessage}
            <div className="absolute -bottom-1 left-3 w-2 h-2 bg-gray-800 transform rotate-45"></div>
          </div>
        </div>
      </div>

      {/* Gold Coins Floating */}
      <div className="absolute top-40 right-24 opacity-12">
        <div
          className="text-4xl animate-spin"
          style={{ animationDuration: '8s' }}
        >
          🪙
        </div>
      </div>

      <div className="absolute bottom-40 left-32 opacity-10">
        <div
          className="text-3xl animate-spin"
          style={{ animationDuration: '6s', animationDelay: '2s' }}
        >
          💰
        </div>
      </div>

      {/* Gold Sparkles */}
      <div className="absolute top-1/2 left-20 opacity-15">
        <div
          className="text-2xl animate-pulse"
          style={{ animationDuration: '3s' }}
        >
          ✨
        </div>
      </div>

      <div className="absolute top-32 right-32 opacity-12">
        <div
          className="text-xl animate-pulse"
          style={{ animationDuration: '4s', animationDelay: '1s' }}
        >
          ⭐
        </div>
      </div>

      {/* Central Content */}
      <div className="relative z-10 text-center">
        {/* Top small text */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-gray-400 text-sm">
            Manage every move strategically
          </span>
          <div className="w-4 h-0.5 bg-gray-600"></div>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
          Play, Risk, Win.
          <br />
          <span className="text-gray-400">Repeat This</span>
        </h1>

        {/* Subtitle with gold emphasis */}
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          Master the art of blind chess with real economic stakes. Every move
          costs{' '}
          <span className="text-yellow-400 font-semibold inline-flex items-center gap-1">
            gold <span className="text-sm">🪙</span>
          </span>
          , every decision shapes your financial future on the board.
        </p>

        {/* Gold tagline */}
        <div className="text-yellow-400 font-medium mb-12 flex items-center justify-center gap-2">
          <span>💰</span>
          <span>No free moves. Every choice costs.</span>
          <span>💰</span>
        </div>

        {/* CTA Button */}
        <button className="bg-white text-black font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors mb-8">
          Start Playing Now
        </button>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-green-500 rounded-sm"></div>
            ))}
          </div>
          <span className="text-white font-medium">4.9</span>
          <span className="text-gray-400">438 reviews on</span>
          <span className="text-white font-medium">ChessClub</span>
        </div>
      </div>

      {/* Bottom - Partner Logos */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-8 opacity-30">
          <div className="text-gray-500 font-bold">Chess.com</div>
          <div className="text-gray-500 font-bold">Lichess</div>
          <div className="text-gray-500 font-bold">FIDE</div>
          <div className="text-gray-500 font-bold">ChessClub</div>
          <div className="text-gray-500 font-bold">Chess24</div>
        </div>
      </div>

      {/* Bottom Light Effect */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-white/10 to-transparent blur-3xl"></div>
    </section>
  );
};

export default HeroSection;
