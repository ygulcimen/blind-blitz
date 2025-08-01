import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

import type { Violation, ViolationSeverity } from './types';

interface ViolationContextType {
  violations: Violation[];
  showViolation: boolean;
  showViolationMessage: (
    message: string,
    severity?: ViolationSeverity,
    icon?: string,
    duration?: number
  ) => void;
  showViolations: (violations: Violation[], duration?: number) => void;
  clearViolations: () => void;
  createViolation: {
    // Chess-specific violations
    invalidMove: (message?: string) => Violation;
    wrongTurn: (player: 'white' | 'black') => Violation;
    inCheck: (player: 'white' | 'black') => Violation;
    gameEnded: () => Violation;
    timeRunning: () => Violation;
    pieceExhausted: (
      piece: string,
      moveCount: number,
      limit: number
    ) => Violation;
    moveLimit: (current: number, max: number) => Violation;
    success: (message: string) => Violation;
  };
}

const ViolationContext = createContext<ViolationContextType | undefined>(
  undefined
);

interface ViolationProviderProps {
  children: ReactNode;
}

export const ViolationProvider: React.FC<ViolationProviderProps> = ({
  children,
}) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [showViolation, setShowViolation] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showViolations = useCallback(
    (violationList: Violation[], duration = 2500) => {
      setViolations(violationList);
      setShowViolation(true);

      setTimeout(() => {
        setShowViolation(false);
        setTimeout(() => setViolations([]), 500);
      }, duration);
    },
    []
  );

  const showViolationMessage = useCallback(
    (
      message: string,
      severity: ViolationSeverity = 'error',
      icon?: string,
      duration = 2500
    ) => {
      const violation: Violation = {
        id: generateId(),
        message,
        severity,
        icon: icon || getSeverityIcon(severity),
        color: getSeverityColor(severity),
        timestamp: Date.now(),
      };

      showViolations([violation], duration);
    },
    [showViolations]
  );

  const clearViolations = useCallback(() => {
    setViolations([]);
    setShowViolation(false);
  }, []);

  const getSeverityIcon = (severity: ViolationSeverity): string => {
    switch (severity) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '❌';
    }
  };

  const getSeverityColor = (severity: ViolationSeverity): string => {
    switch (severity) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      case 'success':
        return '#22c55e';
      default:
        return '#ef4444';
    }
  };

  const createViolation = {
    invalidMove: (
      message = "Invalid move! That piece can't move there."
    ): Violation => ({
      id: generateId(),
      icon: '❌',
      message,
      severity: 'error' as const,
      color: '#ef4444',
      timestamp: Date.now(),
    }),

    wrongTurn: (player: 'white' | 'black'): Violation => ({
      id: generateId(),
      icon: '⚠️',
      message: `It's ${player}'s turn to move!`,
      severity: 'warning' as const,
      color: '#f59e0b',
      timestamp: Date.now(),
    }),

    inCheck: (player: 'white' | 'black'): Violation => ({
      id: generateId(),
      icon: '🛡️',
      message: `${player} is in check! You must protect your king.`,
      severity: 'warning' as const,
      color: '#f59e0b',
      timestamp: Date.now(),
    }),

    gameEnded: (): Violation => ({
      id: generateId(),
      icon: '🏁',
      message: 'Game has ended! No more moves allowed.',
      severity: 'info' as const,
      color: '#3b82f6',
      timestamp: Date.now(),
    }),

    timeRunning: (): Violation => ({
      id: generateId(),
      icon: '⏰',
      message: 'Time is running out! Make your move quickly.',
      severity: 'warning' as const,
      color: '#f59e0b',
      timestamp: Date.now(),
    }),

    pieceExhausted: (
      piece: string,
      moveCount: number,
      limit: number
    ): Violation => ({
      id: generateId(),
      icon: '🚫',
      message: `This ${piece} has already moved ${moveCount} times (limit: ${limit})`,
      severity: 'error' as const,
      color: '#ef4444',
      timestamp: Date.now(),
    }),

    moveLimit: (current: number, max: number): Violation => ({
      id: generateId(),
      icon: '🛑',
      message: `Maximum of ${max} moves allowed! You have made ${current} moves.`,
      severity: 'error' as const,
      color: '#ef4444',
      timestamp: Date.now(),
    }),

    success: (message: string): Violation => ({
      id: generateId(),
      icon: '✅',
      message,
      severity: 'success' as const,
      color: '#22c55e',
      timestamp: Date.now(),
    }),
  };

  return (
    <ViolationContext.Provider
      value={{
        violations,
        showViolation,
        showViolationMessage,
        showViolations,
        clearViolations,
        createViolation,
      }}
    >
      {children}
    </ViolationContext.Provider>
  );
};

export const useViolations = (): ViolationContextType => {
  const context = useContext(ViolationContext);
  if (context === undefined) {
    throw new Error('useViolations must be used within a ViolationProvider');
  }
  return context;
};
