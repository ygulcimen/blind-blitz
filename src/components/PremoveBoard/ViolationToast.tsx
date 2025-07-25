import type { ViolationDisplay } from '../../services/chess';

interface Props {
  show: boolean;
  violations: ViolationDisplay[];
}

const ViolationToast = ({ show, violations }: Props) => {
  if (violations.length === 0) return null;

  return (
    <div
      className={`
      transition-all duration-500 transform
      ${
        show
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-2'
      }
      bg-gradient-to-r from-red-900/90 to-red-800/90 
      border border-red-600/50 rounded-xl p-4 max-w-md
      backdrop-blur-sm shadow-xl
      ${show ? 'animate-pulse' : ''}
    `}
    >
      {violations.map((violation, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-2xl animate-bounce">{violation.icon}</span>
          <span className="text-red-100 font-medium text-sm leading-relaxed">
            {violation.message}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ViolationToast;
