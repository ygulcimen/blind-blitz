// src/components/layout/Navigation.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm">BC</span>
            </div>
            <span className="text-white font-bold text-lg">BLINDCHESS</span>
          </button>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('/games')}
              className={`text-sm font-medium transition-colors ${
                isActive('/games')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Games
            </button>
            <button
              onClick={() => handleNavClick('/rewards')}
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                isActive('/rewards')
                  ? 'text-yellow-400'
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              🎁 Rewards
            </button>
            <button
              onClick={() => handleNavClick('/leaderboard')}
              className={`text-sm font-medium transition-colors ${
                isActive('/leaderboard')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => handleNavClick('/about')}
              className={`text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              About us
            </button>
            <button
              onClick={() => handleNavClick('/faq')}
              className={`text-sm font-medium transition-colors ${
                isActive('/faq')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => handleNavClick('/how-to-play')}
              className={`text-sm font-medium transition-colors ${
                isActive('/how-to-play')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              How to Play
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => handleNavClick('/login')}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => handleNavClick('/signup')}
              className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 space-y-3">
            {/* Navigation Links */}
            <button
              onClick={() => handleNavClick('/games')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive('/games')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Games
            </button>
            <button
              onClick={() => handleNavClick('/rewards')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive('/rewards')
                  ? 'bg-white/10 text-yellow-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-yellow-400'
              }`}
            >
              🎁 Rewards
            </button>
            <button
              onClick={() => handleNavClick('/leaderboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive('/leaderboard')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => handleNavClick('/about')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive('/about')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('/faq')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive('/faq')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => handleNavClick('/how-to-play')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive('/how-to-play')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              How to Play
            </button>

            {/* Divider */}
            <div className="border-t border-white/10 my-4"></div>

            {/* Auth Buttons */}
            {user ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleNavClick('/profile')}
                  className="w-full text-left px-4 py-3 rounded-lg text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Profile
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => handleNavClick('/login')}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick('/signup')}
                  className="w-full bg-white text-black px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
