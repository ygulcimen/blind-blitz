// components/WaitingRoom/PaymentFailedScreen.tsx
import React from 'react';

interface PaymentFailedScreenProps {
  error: string | null;
}

export const PaymentFailedScreen: React.FC<PaymentFailedScreenProps> = ({
  error,
}) => {
  return (
    <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-orange-900/10 to-red-900/20 animate-pulse" />
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto p-6">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-black mb-3 text-red-400">
          PAYMENT FAILED
        </h1>
        <p className="text-lg text-gray-300 mb-5">
          {error || 'Unable to process entry fees'}
        </p>
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
          <p className="text-red-300 text-sm">
            Players have been returned to ready room. Please ensure all players
            have sufficient gold and try again.
          </p>
        </div>
        <div className="text-gray-500 text-sm">
          Returning to waiting room in a moment...
        </div>
      </div>
    </div>
  );
};
