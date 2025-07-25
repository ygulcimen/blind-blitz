const LegendPanel = () => {
  return (
    <div className="mt-6 text-center space-y-3 max-w-2xl">
      <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur">
        <p className="text-gray-300 mb-3">
          <span className="text-blue-400 font-bold">💡 Strategy Tip:</span> Each
          piece can only move twice in the blind phase!
        </p>

        <div className="flex justify-center gap-6 text-sm">
          {[
            {
              color: 'bg-green-500',
              label: 'Available',
              textColor: 'text-green-400',
            },
            {
              color: 'bg-yellow-500',
              label: '1 move left',
              textColor: 'text-yellow-400',
            },
            {
              color: 'bg-red-500',
              label: 'Exhausted',
              textColor: 'text-red-400',
            },
          ].map(({ color, label, textColor }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-4 h-4 ${color} rounded-full border-2 border-current shadow-lg`}
              ></div>
              <span className={`${textColor} font-medium`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegendPanel;
