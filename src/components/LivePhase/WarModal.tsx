// components/LivePhase/WarModal.tsx
import React from 'react';

interface WarModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon: string;
}

export const WarModal: React.FC<WarModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  confirmColor,
  onConfirm,
  onCancel,
  icon,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative">
        {/* Epic war glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl blur-xl animate-pulse" />

        <div className="relative bg-gray-900/90 border border-gray-700 rounded-2xl shadow-2xl backdrop-blur-sm p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">{icon}</div>
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{message}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 ${confirmColor} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
