import React from 'react';

const BottomBanner: React.FC = () => {
  return (
    <div className="mt-16 text-center">
      <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 backdrop-blur-lg rounded-3xl px-12 py-8 border border-amber-500/30 shadow-2xl inline-block">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-4xl animate-bounce">⚡</span>
          <h3 className="text-2xl lg:text-3xl font-black text-amber-300">
            BLITZ WARFARE
          </h3>
          <span className="text-4xl animate-bounce delay-500">⚡</span>
        </div>
        <p className="text-lg text-amber-200 font-semibold mb-2">
          3 Minutes + 2 Second Increment • Every Move Matters
        </p>
        <p className="text-amber-100/80 text-sm">
          🔥 Pressure builds with every tick • Victory belongs to the swift! 🔥
        </p>
      </div>
    </div>
  );
};

export default BottomBanner;
