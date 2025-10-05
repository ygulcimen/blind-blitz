// src/components/layout/ModernNavigation.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  isAction?: boolean; // ✅ For special actions like logout
}

const ModernNavigation: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGameMode, setIsGameMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth(); // ✅ Get auth functions

  // Check if we're in actual game mode (playing) or auth pages
  useEffect(() => {
    const gameRoutes = ['/login', '/signup'];
    const actualGameRoutes = location.pathname.startsWith('/game/'); // Only specific game instances
    const isInGame =
      gameRoutes.some((route) => location.pathname.startsWith(route)) ||
      actualGameRoutes;
    setIsGameMode(isInGame);
  }, [location.pathname]);

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      setIsExpanded(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems: NavItem[] = [
    // Only show these nav items to authenticated users
    ...(user
      ? [
          {
            id: 'games',
            label: 'Games',
            path: '/games',
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            ),
          },
          {
            id: 'rewards',
            label: 'Rewards',
            path: '/rewards',
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            ),
          },
          {
            id: 'tournaments',
            label: 'Tournaments',
            path: '/tournaments',
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            ),
          },
          {
            id: 'leaderboard',
            label: 'Leaderboard',
            path: '/leaderboard',
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            ),
          },
          {
            id: 'profile',
            label: 'Profile',
            path: '/profile',
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            ),
          },
          {
            id: 'logout',
            label: 'Logout',
            path: '#',
            isAction: true,
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            ),
          },
        ]
      : [
          // Only show these to unauthenticated users
          {
            id: 'about',
            label: 'About',
            path: '/about',
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
          {
            id: 'faq',
            label: 'FAQ',
            path: '/faq',
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
        ]),
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsExpanded(false); // Auto-collapse after navigation
  };

  // ✅ Handle both navigation and actions
  const handleItemClick = (item: NavItem) => {
    if (item.id === 'logout') {
      handleLogout();
    } else {
      handleNavClick(item.path);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Only hide in specific auth/game routes, but NEVER in lobby/games list
  if (
    isGameMode &&
    (location.pathname.startsWith('/game/') ||
      location.pathname === '/login' ||
      location.pathname === '/signup')
  ) {
    return null;
  }

  return (
    <>
      {/* Main Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-500 ease-out ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Background with glassmorphism */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl border-r border-white/10" />

        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* Logo Section - Clickable to Home */}
          <div className="flex items-center h-16 px-4 border-b border-white/10">
            <button
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity w-full"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-black font-black text-sm">BC</span>
              </div>
              <div
                className={`text-white font-bold text-lg transition-all duration-300 ${
                  isExpanded
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                }`}
              >
                BLINDCHESS
              </div>
            </button>
          </div>

          {/* User Info Section (when logged in) */}
          {user && (
            <div className="px-3 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {user.user_metadata?.username?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div
                  className={`transition-all duration-300 ${
                    isExpanded
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  }`}
                >
                  <div className="text-white text-sm font-medium truncate">
                    {user.user_metadata?.username || 'Player'}
                  </div>
                  <div className="text-green-400 text-xs">Online</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex-1 py-6">
            <div className="space-y-2 px-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                    isActive(item.path) && !item.isAction
                      ? 'bg-white/10 text-white shadow-lg'
                      : item.id === 'logout'
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 relative">
                    {item.icon}
                    {/* Active indicator */}
                    {isActive(item.path) && !item.isAction && (
                      <div className="absolute -inset-1 bg-white/20 rounded-lg blur-sm" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`font-medium transition-all duration-300 whitespace-nowrap ${
                      isExpanded
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-4 pointer-events-none'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Hover effect line */}
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-all duration-300 ${
                      isActive(item.path) && !item.isAction
                        ? 'bg-white opacity-100 scale-100'
                        : item.id === 'logout'
                        ? 'bg-red-400 opacity-0 scale-y-0 group-hover:opacity-50 group-hover:scale-100'
                        : 'bg-white opacity-0 scale-y-0 group-hover:opacity-50 group-hover:scale-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Collapse Indicator */}
          <div className="absolute -right-3 top-8">
            <div
              className={`w-6 h-6 bg-black/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            >
              <svg
                className="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for content */}
      <div
        className={`transition-all duration-500 ${
          isExpanded ? 'ml-64' : 'ml-16'
        }`}
      />
    </>
  );
};

export default ModernNavigation;
