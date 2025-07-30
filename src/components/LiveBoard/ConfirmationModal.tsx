import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  type: 'resign' | 'abort';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  type,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const config = {
    resign: {
      icon: '🏳️',
      title: 'SURRENDER?',
      message:
        'Are you ready to wave the white flag? This battle will end immediately and your opponent will claim victory!',
      confirmText: '🏳️ RESIGN',
      cancelText: '🛡️ FIGHT ON',
      borderColor: 'border-red-500/30',
      titleGradient: 'from-red-400 to-red-600',
      confirmGradient:
        'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600',
    },
    abort: {
      icon: '⚡',
      title: 'ABORT BATTLE?',
      message:
        'This will instantly cancel the epic showdown and return you to the main arena. No victor will be crowned!',
      confirmText: '⚡ ABORT',
      cancelText: '⚔️ CONTINUE',
      borderColor: 'border-orange-500/30',
      titleGradient: 'from-orange-400 to-orange-600',
      confirmGradient:
        'from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600',
    },
  };

  const {
    icon,
    title,
    message,
    confirmText,
    cancelText,
    borderColor,
    titleGradient,
    confirmGradient,
  } = config[type];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 max-w-md w-full border-2 ${borderColor} shadow-2xl transform animate-pulse`}
      >
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce">{icon}</div>
          <h3
            className={`text-3xl font-black text-white mb-4 bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}
          >
            {title}
          </h3>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            {message}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onCancel}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`bg-gradient-to-r ${confirmGradient} text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
