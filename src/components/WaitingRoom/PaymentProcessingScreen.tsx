// components/WaitingRoom/PaymentProcessingScreen.tsx
import React from 'react';

interface PaymentProcessingScreenProps {
  entryFee: number;
}

export const PaymentProcessingScreen: React.FC<
  PaymentProcessingScreenProps
> = ({ entryFee }) => {
  return (
    <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-orange-900/10 to-yellow-900/20 animate-pulse" />
      </div>

      <div className="relative z-10 text-center">
        {/* Branded Logo with Golden Glow */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 blur-xl animate-pulse" />
          <img
            src="/logo.png"
            alt="BlindBlitz"
            className="relative w-24 h-24 mx-auto rounded-lg animate-pulse drop-shadow-2xl"
          />
        </div>

        <div className="text-4xl mb-4">💰</div>
        <h1 className="text-4xl font-black mb-3 text-yellow-400">
          PROCESSING PAYMENTS
        </h1>
        <p className="text-lg text-gray-300 mb-5">
          Charging entry fees of {entryFee} gold each...
        </p>
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-0"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};
