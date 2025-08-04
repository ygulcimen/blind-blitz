import React from 'react';

const LegendPanel: React.FC = () => {
  return (
    <div className="bg-black/20 backdrop-blur-lg rounded-xl shadow-lg border border-white/10 p-3">
      {/* Header - Compact */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-sm">💡</span>
        <h3 className="text-sm font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Piece Status
        </h3>
      </div>

      {/* Status Indicators - Ultra Compact */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
          <span className="text-green-400 font-medium">
            Fresh (2 moves left)
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
          <span className="text-yellow-400 font-medium">
            Used (1 move left)
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
          <span className="text-red-400 font-medium">Exhausted (0 left)</span>
        </div>
      </div>

      {/* Rules - Super Compact */}
      <div className="pt-2 border-t border-gray-700/50">
        <div className="text-blue-400 font-bold text-xs text-center mb-1">
          ⚡ Limits
        </div>
        <div className="text-blue-200 text-xs space-y-0.5">
          <div>• 5 moves total</div>
          <div>• 2 per piece max</div>
        </div>
      </div>
    </div>
  );
};

export default LegendPanel;
