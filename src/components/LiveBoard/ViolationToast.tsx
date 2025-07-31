import React from 'react';

interface ViolationDisplay {
  icon: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  color: string;
}

interface Props {
  show: boolean;
  violations: ViolationDisplay[];
}

const ViolationToast: React.FC<Props> = ({ show, violations }) => {
  if (violations.length === 0) return null;

  const getSeverityStyles = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return 'from-red-900/90 to-red-800/90 border-red-600/50';
      case 'warning':
        return 'from-yellow-900/90 to-yellow-800/90 border-yellow-600/50';
      case 'info':
        return 'from-blue-900/90 to-blue-800/90 border-blue-600/50';
      default:
        return 'from-red-900/90 to-red-800/90 border-red-600/50';
    }
  };

  return (
    <div
      className={`
      transition-all duration-500 transform
      ${
        show
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-2'
      }
      bg-gradient-to-r ${getSeverityStyles(violations[0]?.severity || 'error')}
      rounded-xl p-4 max-w-md mx-auto
      backdrop-blur-sm shadow-xl border
      ${show ? 'animate-pulse' : ''}
    `}
    >
      <div className="space-y-2">
        {violations.map((violation, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">{violation.icon}</span>
            <span className="text-white font-medium text-sm leading-relaxed flex-1">
              {violation.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViolationToast;
