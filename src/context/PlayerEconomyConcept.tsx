// src/context/PlayerEconomyContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Transaction {
  id: string;
  type:
    | 'game_entry'
    | 'game_win'
    | 'game_loss'
    | 'loan'
    | 'loan_payment'
    | 'puzzle_reward'
    | 'insurance_purchase';
  amount: number;
  timestamp: Date;
  description: string;
}

export interface LoanInfo {
  amount: number;
  interestRate: number;
  dueDate: Date;
  dailyInterest: number;
}

export interface PlayerEconomyState {
  gold: number;
  totalEarned: number;
  totalSpent: number;
  currentLoan: LoanInfo | null;
  transactions: Transaction[];
  puzzlesCompletedToday: number;
  maxDailyPuzzles: number;
}

export interface PlayerEconomyContextType {
  state: PlayerEconomyState;
  deductGold: (amount: number, reason: string) => boolean;
  addGold: (amount: number, reason: string) => void;
  takeLoan: (amount: number) => boolean;
  canAfford: (amount: number) => boolean;
  getDebtStatus: () => {
    hasDebt: boolean;
    debtAmount: number;
    canBorrow: boolean;
  };
  resetDaily: () => void;
}

const PlayerEconomyContext = createContext<PlayerEconomyContextType | null>(
  null
);

const STARTING_GOLD = 1000;
const MAX_DEBT_LIMIT = 500;
const DAILY_PUZZLE_LIMIT = 3;
const LOAN_INTEREST_RATE = 0.15; // 15% daily interest

export const PlayerEconomyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<PlayerEconomyState>(() => ({
    gold: STARTING_GOLD,
    totalEarned: STARTING_GOLD,
    totalSpent: 0,
    currentLoan: null,
    transactions: [
      {
        id: 'welcome',
        type: 'game_win',
        amount: STARTING_GOLD,
        timestamp: new Date(),
        description: 'Welcome bonus - spend wisely!',
      },
    ],
    puzzlesCompletedToday: 0,
    maxDailyPuzzles: DAILY_PUZZLE_LIMIT,
  }));

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
      const newTransaction: Transaction = {
        ...transaction,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions].slice(0, 50), // Keep last 50
      }));
    },
    []
  );

  const deductGold = useCallback(
    (amount: number, reason: string): boolean => {
      if (amount <= 0) return false;

      setState((prev) => {
        if (prev.gold < amount) return prev; // Not enough gold

        const newState = {
          ...prev,
          gold: prev.gold - amount,
          totalSpent: prev.totalSpent + amount,
        };

        addTransaction({
          type: 'game_entry' as const,
          amount: -amount,
          description: reason,
        });

        return newState;
      });

      return true;
    },
    [addTransaction]
  );

  const addGold = useCallback(
    (amount: number, reason: string) => {
      if (amount <= 0) return;

      setState((prev) => ({
        ...prev,
        gold: prev.gold + amount,
        totalEarned: prev.totalEarned + amount,
      }));

      addTransaction({
        type: 'game_win',
        amount: amount,
        description: reason,
      });
    },
    [addTransaction]
  );

  const takeLoan = useCallback(
    (amount: number): boolean => {
      if (amount <= 0 || amount > MAX_DEBT_LIMIT) return false;

      setState((prev) => {
        if (prev.currentLoan) return prev; // Already has loan

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // 7 days to repay

        const newLoan: LoanInfo = {
          amount,
          interestRate: LOAN_INTEREST_RATE,
          dueDate,
          dailyInterest: amount * LOAN_INTEREST_RATE,
        };

        addTransaction({
          type: 'loan',
          amount: amount,
          description: `Bank loan - ${
            LOAN_INTEREST_RATE * 100
          }% daily interest`,
        });

        return {
          ...prev,
          gold: prev.gold + amount,
          currentLoan: newLoan,
        };
      });

      return true;
    },
    [addTransaction]
  );

  const canAfford = useCallback(
    (amount: number): boolean => {
      return state.gold >= amount;
    },
    [state.gold]
  );

  const getDebtStatus = useCallback(() => {
    const hasDebt = state.currentLoan !== null;
    const debtAmount = state.currentLoan?.amount || 0;
    const canBorrow = !hasDebt && state.gold < MAX_DEBT_LIMIT;

    return { hasDebt, debtAmount, canBorrow };
  }, [state.currentLoan, state.gold]);

  const resetDaily = useCallback(() => {
    setState((prev) => ({
      ...prev,
      puzzlesCompletedToday: 0,
    }));
  }, []);

  const contextValue: PlayerEconomyContextType = {
    state,
    deductGold,
    addGold,
    takeLoan,
    canAfford,
    getDebtStatus,
    resetDaily,
  };

  return (
    <PlayerEconomyContext.Provider value={contextValue}>
      {children}
    </PlayerEconomyContext.Provider>
  );
};

export const usePlayerEconomy = (): PlayerEconomyContextType => {
  const context = useContext(PlayerEconomyContext);
  if (!context) {
    throw new Error(
      'usePlayerEconomy must be used within PlayerEconomyProvider'
    );
  }
  return context;
};
