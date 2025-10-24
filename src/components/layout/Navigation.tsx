// src/components/layout/Navigation.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.language-dropdown')) {
          setLanguageMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [languageMenuOpen]);

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
          {/* Logo & Language Selector */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src="/logo.png" alt="BlindBlitz" className="w-8 h-8 rounded-lg" />
              <span className="text-white font-bold text-lg">BLINDBLITZ</span>
            </button>

            {/* Language Toggle - SUPER VISIBLE */}
            <button
              onClick={() => {
                const newLang = currentLanguage === 'en' ? 'tr' : 'en';
                i18n.changeLanguage(newLang);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 border-2 border-yellow-300 transition-all shadow-lg"
              title={currentLanguage === 'en' ? 'Switch to Turkish' : 'Switch to English'}
            >
              <span className="text-2xl">{currentLanguage === 'tr' ? '🇹🇷' : '🇬🇧'}</span>
              <span className="text-black text-sm font-bold">{currentLanguage === 'tr' ? 'TR' : 'EN'}</span>
            </button>
          </div>

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
              {t('navigation.play')}
            </button>
            <button
              onClick={() => handleNavClick('/rewards')}
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                isActive('/rewards')
                  ? 'text-yellow-400'
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              🎁 {t('navigation.rewards')}
            </button>
            <button
              onClick={() => handleNavClick('/leaderboard')}
              className={`text-sm font-medium transition-colors ${
                isActive('/leaderboard')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('navigation.leaderboard')}
            </button>
            <button
              onClick={() => handleNavClick('/about')}
              className={`text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('navigation.about')}
            </button>
            <button
              onClick={() => handleNavClick('/faq')}
              className={`text-sm font-medium transition-colors ${
                isActive('/faq')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('navigation.faq')}
            </button>
            <button
              onClick={() => handleNavClick('/how-to-play')}
              className={`text-sm font-medium transition-colors ${
                isActive('/how-to-play')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('navigation.howToPlay')}
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={() => handleNavClick('/profile')}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                {t('navigation.profile')}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('/login')}
                  className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                >
                  {t('navigation.login')}
                </button>
                <button
                  onClick={() => handleNavClick('/signup')}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  {t('navigation.signup')}
                </button>
              </>
            )}
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
              {t('navigation.play')}
            </button>
            <button
              onClick={() => handleNavClick('/rewards')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive('/rewards')
                  ? 'bg-white/10 text-yellow-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-yellow-400'
              }`}
            >
              🎁 {t('navigation.rewards')}
            </button>
            <button
              onClick={() => handleNavClick('/leaderboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive('/leaderboard')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t('navigation.leaderboard')}
            </button>
            <button
              onClick={() => handleNavClick('/about')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive('/about')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t('navigation.about')}
            </button>
            <button
              onClick={() => handleNavClick('/faq')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive('/faq')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t('navigation.faq')}
            </button>
            <button
              onClick={() => handleNavClick('/how-to-play')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive('/how-to-play')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t('navigation.howToPlay')}
            </button>

            {/* Divider */}
            <div className="border-t border-white/10 my-4"></div>

            {/* Language Selector */}
            <div className="space-y-2">
              <div className="text-gray-500 text-xs uppercase px-4 mb-2">Language</div>
              <button
                onClick={() => i18n.changeLanguage('en')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  currentLanguage === 'en'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">🇬🇧</span>
                <span>English</span>
              </button>
              <button
                onClick={() => i18n.changeLanguage('tr')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  currentLanguage === 'tr'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">🇹🇷</span>
                <span>Türkçe</span>
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-4"></div>

            {/* Auth Buttons */}
            {user ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleNavClick('/profile')}
                  className="w-full text-left px-4 py-3 rounded-lg text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {t('navigation.profile')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => handleNavClick('/login')}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {t('navigation.login')}
                </button>
                <button
                  onClick={() => handleNavClick('/signup')}
                  className="w-full bg-white text-black px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
                >
                  {t('navigation.signup')}
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
