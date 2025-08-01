import React from 'react';

const LegendPanel: React.FC = () => {
  return (
    <div className="bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/10 p-4 lg:p-6">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xl">📖</span>
        <h3 className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Legend
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        {/* Available Pieces */}
        <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-600/30 rounded-lg p-3 text-center">
          <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-2 animate-pulse"></div>
          <div className="text-green-400 font-bold text-xs mb-1">Available</div>
          <div className="text-green-300 text-xs">Can move freely</div>
        </div>

        {/* Warning Pieces */}
        <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-600/30 rounded-lg p-3 text-center">
          <div className="w-4 h-4 bg-yellow-600 rounded-full mx-auto mb-2 animate-pulse"></div>
          <div className="text-yellow-400 font-bold text-xs mb-1">Warning</div>
          <div className="text-yellow-300 text-xs">1 move left</div>
        </div>

        {/* Exhausted Pieces */}
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-600/30 rounded-lg p-3 text-center">
          <div className="w-4 h-4 bg-red-600 rounded-full mx-auto mb-2 animate-pulse"></div>
          <div className="text-red-400 font-bold text-xs mb-1">Exhausted</div>
          <div className="text-red-300 text-xs">Cannot move</div>
        </div>
      </div>

      {/* Rules Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <div className="text-blue-400 font-bold text-xs mb-2 flex items-center justify-center gap-2">
            <span>ℹ️</span>
            <span>BlindChess Rules</span>
          </div>
          <ul className="text-blue-200 text-xs space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              <span>Maximum 5 moves total</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              <span>Maximum 2 moves per piece</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              <span>Cannot see opponent's pieces</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LegendPanel;
