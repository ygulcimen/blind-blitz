import { useState } from 'react';

export interface ViolationDisplay {
  icon: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  color: string;
}

export const useViolationToast = () => {
  const [violations, setViolations] = useState<ViolationDisplay[]>([]);
  const [showViolation, setShowViolation] = useState(false);

  const showViolationTemporarily = (
    violationList: ViolationDisplay[],
    duration = 2500
  ) => {
    setViolations(violationList);
    setShowViolation(true);

    setTimeout(() => {
      setShowViolation(false);
      setTimeout(() => setViolations([]), 500);
    }, duration);
  };

  const clearViolations = () => {
    setViolations([]);
    setShowViolation(false);
  };

  // Common violation types for chess
  const createViolation = {
    invalidMove: (message = "Invalid move! That piece can't move there.") => ({
      icon: '❌',
      message,
      severity: 'error' as const,
      color: '#ef4444',
    }),
    wrongTurn: (player: 'white' | 'black') => ({
      icon: '⚠️',
      message: `It's ${player}'s turn to move!`,
      severity: 'warning' as const,
      color: '#f59e0b',
    }),
    inCheck: (player: 'white' | 'black') => ({
      icon: '🛡️',
      message: `${player} is in check! You must protect your king.`,
      severity: 'warning' as const,
      color: '#f59e0b',
    }),
    gameEnded: () => ({
      icon: '🏁',
      message: 'Game has ended! No more moves allowed.',
      severity: 'info' as const,
      color: '#3b82f6',
    }),
    timeRunning: () => ({
      icon: '⏰',
      message: 'Time is running out! Make your move quickly.',
      severity: 'warning' as const,
      color: '#f59e0b',
    }),
  };

  return {
    violations,
    showViolation,
    showViolationTemporarily,
    clearViolations,
    createViolation,
  };
};
