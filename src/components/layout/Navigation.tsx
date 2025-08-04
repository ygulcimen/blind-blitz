import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePlayerEconomy } from '../../context/PlayerEconomyConcept';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { state: economy, getDebtStatus } = usePlayerEconomy();

  const isActive = (path: string) => location.pathname === path;
  const { hasDebt, debtAmount } = getDebtStatus();

  // Gold display with status
  const getGoldStatus = () => {
    if (hasDebt) return 'debt';
    if (economy.gold < 100) return 'low';
    if (economy.gold > 500) return 'rich';
    return 'normal';
  };

  const goldStatus = getGoldStatus();

  const GoldBalance: React.FC = () => (
    <div className="flex items-center space-x-2">
      <div
        className={`
        px-3 py-1.5 rounded-lg border transition-all duration-300 hover:scale-105 cursor-pointer
        ${
          goldStatus === 'debt'
            ? 'bg-red-900/30 border-red-500/50 text-red-400'
            : goldStatus === 'low'
            ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400'
            : goldStatus === 'rich'
            ? 'bg-green-900/30 border-green-500/50 text-green-400'
            : 'bg-blue-900/30 border-blue-500/50 text-blue-400'
        }
      `}
        title={hasDebt ? `Debt: ${debtAmount} gold` : 'Current gold balance'}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">
            {goldStatus === 'debt'
              ? '💸'
              : goldStatus === 'low'
              ? '⚠️'
              : goldStatus === 'rich'
              ? '💰'
              : '🪙'}
          </span>
          <span className="font-bold">
            {hasDebt ? `-${debtAmount}` : economy.gold}
          </span>
          <span className="text-xs opacity-75">GOLD</span>
        </div>
      </div>

      {/* Quick Bank Access for Low Gold */}
      {(goldStatus === 'low' || goldStatus === 'debt') && (
        <Link
          to="/bank"
          className="px-2 py-1 rounded-md bg-purple-600/20 border border-purple-500/50 text-purple-400 hover:bg-purple-600/30 transition-all text-xs"
          title="Visit Bank"
        >
          🏦
        </Link>
      )}
    </div>
  );

  return (
    <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-3xl lg:text-4xl group-hover:animate-bounce">
              ♟️
            </div>
            <div className="text-xl lg:text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
              BlindChess
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive('/')
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Home
              </Link>
              <Link
                to="/lobby"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive('/lobby')
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Play
              </Link>
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive('/profile')
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive('/settings')
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Settings
              </Link>
            </div>

            {/* Gold Balance */}
            <GoldBalance />

            {/* CTA Button */}
            <Link
              to="/lobby"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 
                         text-white font-bold px-6 py-2 rounded-lg 
                         transition-all duration-300 transform hover:scale-105 active:scale-95
                         shadow-lg hover:shadow-blue-500/30"
            >
              🚀 Play Now
            </Link>
          </div>

          {/* Mobile menu button + Gold */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Gold Balance */}
            <div className="scale-90">
              <GoldBalance />
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isActive('/')
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link
                to="/lobby"
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isActive('/lobby')
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                ⚔️ Play
              </Link>
              <Link
                to="/profile"
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isActive('/profile')
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                👤 Profile
              </Link>
              <Link
                to="/settings"
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isActive('/settings')
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                ⚙️ Settings
              </Link>

              {/* Mobile Bank Link for Low Gold */}
              {(goldStatus === 'low' || goldStatus === 'debt') && (
                <Link
                  to="/bank"
                  className="px-4 py-3 rounded-lg font-medium transition-all duration-300 bg-purple-600/20 text-purple-400 border border-purple-500/30"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🏦 Visit Bank
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
