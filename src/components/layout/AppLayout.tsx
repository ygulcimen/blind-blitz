// src/components/layout/AppLayout.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import ModernNavigation from './ModernNavigation';
import Footer from './Footer';
import { useModal } from '../../context/ModalContext';

interface AppLayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
  hideFooter?: boolean;
}

// Enhanced background elements for gaming feel
const BackgroundElements = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/[0.015] rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/[0.01] rounded-full blur-3xl"></div>

      {/* Subtle geometric grid */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Floating particles for depth */}
      <div
        className="absolute top-20 right-20 w-2 h-2 bg-white/10 rounded-full animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      <div
        className="absolute bottom-32 left-32 w-1 h-1 bg-white/15 rounded-full animate-pulse"
        style={{ animationDuration: '6s', animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white/8 rounded-full animate-pulse"
        style={{ animationDuration: '5s', animationDelay: '1s' }}
      />
    </div>
  );
};

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  hideNavigation = false,
  hideFooter = false,
}) => {
  const { isModalOpen } = useModal();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Enhanced background */}
      <BackgroundElements />

      {/* Modern Navigation (hidden if modal is open or explicitly hidden) */}
      {!hideNavigation && !isModalOpen && <ModernNavigation />}

      {/* Main content with proper spacing - Always account for sidebar except in auth/actual games */}
      <main
        className={`relative z-10 transition-all duration-500 ${
          !hideNavigation &&
          !isModalOpen &&
          !location.pathname.startsWith('/game/') &&
          location.pathname !== '/login' &&
          location.pathname !== '/signup'
            ? 'ml-16'
            : ''
        }`}
      >
        {children}
      </main>

      {/* Footer */}
      {!hideFooter && (
        <footer
          className={`relative z-10 transition-all duration-500 ${
            !hideNavigation &&
            !isModalOpen &&
            !location.pathname.startsWith('/game/') &&
            location.pathname !== '/login' &&
            location.pathname !== '/signup'
              ? 'ml-16'
              : ''
          }`}
        >
          <Footer />
        </footer>
      )}
    </div>
  );
};

export default AppLayout;
