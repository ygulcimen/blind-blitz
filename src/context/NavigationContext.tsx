// src/context/NavigationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  userGold: number;
  setUserGold: (gold: number) => void;
  userName: string;
  userRating: number;
  toggleCollapse: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userGold, setUserGold] = useState(12847); // This should come from your auth system
  const [userName] = useState('ChessMaster'); // This should come from your auth system
  const [userRating] = useState(1847); // This should come from your auth system
  const location = useLocation();

  // Auto-collapse logic for immersive game experience
  useEffect(() => {
    const gameRoutes = ['/game/', '/match/', '/play/', '/tournament/'];
    const isInGameRoute = gameRoutes.some((route) =>
      location.pathname.includes(route)
    );

    if (isInGameRoute) {
      setIsCollapsed(true);
    }
  }, [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const value = {
    isCollapsed,
    setIsCollapsed,
    userGold,
    setUserGold,
    userName,
    userRating,
    toggleCollapse,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Hook for components that need to detect if they're in a "game mode"
export const useGameMode = () => {
  const location = useLocation();
  const gameRoutes = ['/game/', '/match/', '/play/', '/tournament/'];
  return gameRoutes.some((route) => location.pathname.includes(route));
};
