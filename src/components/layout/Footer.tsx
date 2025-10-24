// src/components/layout/Footer.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <footer className="relative bg-black border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand Section - More compact */}
          <div className="lg:col-span-2">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
            >
              <img src="/logo.png" alt="BlindBlitz" className="w-8 h-8 rounded-lg" />
              <div>
                <div className="text-lg font-bold text-white">{t('footer.brand.name')}</div>
                <div className="text-xs text-gray-500">
                  {t('footer.brand.tagline')}
                </div>
              </div>
            </button>

            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-4">
              {t('footer.brand.description')}
            </p>

            {/* Social Links - Gaming style */}
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 bg-gray-800/50 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                <span className="text-gray-400 hover:text-white text-sm">📱</span>
              </button>
              <button className="w-9 h-9 bg-gray-800/50 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                <span className="text-gray-400 hover:text-white text-sm">🐦</span>
              </button>
              <button className="w-9 h-9 bg-gray-800/50 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                <span className="text-gray-400 hover:text-white text-sm">💬</span>
              </button>
            </div>
          </div>

          {/* Game Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">{t('footer.game.title')}</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('/games?mode=classical')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  {t('footer.game.playClassical')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/games?mode=robochaos')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  {t('footer.game.playRoboChaos')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/leaderboard')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  {t('footer.game.leaderboard')}
                </button>
              </li>
            </ul>
          </div>

          {/* Learn Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">{t('footer.learn.title')}</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('/how-to-play')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  {t('footer.learn.howToPlay')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/about')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  {t('footer.learn.about')}
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors text-sm block">
                  {t('footer.learn.strategyGuide')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/faq')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  {t('footer.learn.faq')}
                </button>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">{t('footer.support.title')}</h3>
            <ul className="space-y-2">
              <li>
                <button className="text-gray-400 hover:text-white transition-colors text-sm block">
                  {t('footer.support.contact')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/bug-report')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  {t('footer.support.bugReports')}
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors text-sm block">
                  {t('footer.support.privacy')}
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors text-sm block">
                  {t('footer.support.terms')}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Compact */}
      <div className="border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
            <div className="text-gray-600">
              {t('footer.bottom.copyright')}
            </div>

            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-400 transition-colors">
                {t('footer.bottom.privacy')}
              </button>
              <span className="text-gray-800">•</span>
              <button className="text-gray-600 hover:text-gray-400 transition-colors">
                {t('footer.bottom.terms')}
              </button>
              <span className="text-gray-800">•</span>
              <button className="text-gray-600 hover:text-gray-400 transition-colors">
                {t('footer.bottom.cookies')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
