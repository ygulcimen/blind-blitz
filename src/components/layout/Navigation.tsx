// src/components/layout/Navigation.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    navigate(path);
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
              onClick={() => handleNavClick('/tournaments')}
              className={`text-sm font-medium transition-colors ${
                isActive('/tournaments')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tournaments
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
          <button className="md:hidden text-white">
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
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
