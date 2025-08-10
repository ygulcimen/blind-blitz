// src/components/layout/AppLayout.tsx
import React from 'react';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
  hideFooter?: boolean;
}

// Clean background elements
const BackgroundElements = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Subtle ambient shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-white/[0.008] rounded-full blur-3xl"></div>

      {/* Very subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.008]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
        }}
      />
    </div>
  );
};

// Navigation component matching the reference design
const Navigation = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState('/');

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    setCurrentPage(path);
  };

  const isActive = (path: string) => currentPage === path;

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
            className="flex items-center gap-3"
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

// Clean Footer
const Footer = () => (
  <footer className="relative z-10 border-t border-white/10 bg-black/50 mt-20">
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm">BC</span>
            </div>
            <div>
              <div className="text-lg font-bold text-white">BLINDCHESS</div>
              <div className="text-sm text-gray-400">
                Chess with real stakes
              </div>
            </div>
          </div>
          <p className="text-gray-400 max-w-md leading-relaxed">
            Every move costs gold. Strategic warfare on 64 squares with real
            economic consequences.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Game</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <button className="hover:text-white transition-colors">
                Play Now
              </button>
            </li>
            <li>
              <button className="hover:text-white transition-colors">
                Tournaments
              </button>
            </li>
            <li>
              <button className="hover:text-white transition-colors">
                Leaderboard
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <button className="hover:text-white transition-colors">
                Rules
              </button>
            </li>
            <li>
              <button className="hover:text-white transition-colors">
                FAQ
              </button>
            </li>
            <li>
              <button className="hover:text-white transition-colors">
                Contact
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-500">
        <p>© 2024 BlindChess. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  hideNavigation = false,
  hideFooter = false,
}) => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Clean background */}
      <BackgroundElements />

      {/* Navigation */}
      {!hideNavigation && <Navigation />}

      {/* Main content */}
      <main className={`relative z-10 ${!hideNavigation ? 'pt-16' : ''}`}>
        {children}
      </main>

      {/* Footer */}
      {!hideFooter && <Footer />}
    </div>
  );
};

export default AppLayout;
