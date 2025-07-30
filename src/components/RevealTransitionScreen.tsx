import React from 'react';

interface RevealTransitionScreenProps {
  message: string;
}

const RevealTransitionScreen: React.FC<RevealTransitionScreenProps> = ({
  message,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-radial from-black via-gray-900/90 to-gray-800/80 backdrop-blur-2xl">
      {/* Misty/smoke effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-radial from-gray-700/60 via-transparent to-transparent blur-3xl opacity-60" />
      </div>
      {/* Icon/Loader */}
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-6xl mb-6 animate-fade-in animate-pulse-slow drop-shadow-[0_0_16px_rgba(255,255,255,0.25)]">
          <span className="inline-block animate-spin-slow">♞</span>
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center drop-shadow-[0_0_24px_rgba(255,255,255,0.25)] animate-fade-in animate-pulse-slow">
          {message}
        </h1>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-in;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; text-shadow: 0 0 32px #fff4, 0 0 8px #fff2; }
          50% { opacity: 0.7; text-shadow: 0 0 48px #fff8, 0 0 16px #fff4; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RevealTransitionScreen;
