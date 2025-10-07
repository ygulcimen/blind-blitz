// src/components/layout/Footer.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <footer className="relative bg-black border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-sm">BB</span>
              </div>
              <div>
                <div className="text-xl font-bold text-white">BLINDBLITZ</div>
                <div className="text-sm text-gray-400">
                  Lightning-fast blind chess
                </div>
              </div>
            </button>

            <p className="text-gray-400 leading-relaxed max-w-md mb-6">
              Revolutionary chess platform where every move costs gold. Master
              blind strategy, manage your economy, and dominate the board.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                <span className="text-gray-400 hover:text-white">📱</span>
              </button>
              <button className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                <span className="text-gray-400 hover:text-white">🐦</span>
              </button>
              <button className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                <span className="text-gray-400 hover:text-white">💬</span>
              </button>
            </div>
          </div>

          {/* Game Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Game</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation('/games?mode=classical')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  Play Classical
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/games?mode=robochaos')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  Play RoboChaos
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/leaderboard')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  Leaderboard
                </button>
              </li>
            </ul>
          </div>

          {/* Learn Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Learn</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation('/how-to-play')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  How to Play
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/about')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  About Us
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors text-sm block">
                  Strategy Guide
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors text-sm block">
                  Economy Rules
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/faq')}
                  className="text-gray-400 hover:text-white transition-colors text-sm block"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <button className="text-gray-400 hover:text-white transition-colors text-sm block">
                  Contact Us
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors text-sm block">
                  Bug Reports
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors text-sm block">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors text-sm block">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm">
              © 2025 BlindBlitz. All rights reserved.
            </div>

            <div className="flex items-center gap-6 text-sm">
              <button className="text-gray-500 hover:text-gray-400 transition-colors">
                Privacy
              </button>
              <button className="text-gray-500 hover:text-gray-400 transition-colors">
                Terms
              </button>
              <button className="text-gray-500 hover:text-gray-400 transition-colors">
                Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
