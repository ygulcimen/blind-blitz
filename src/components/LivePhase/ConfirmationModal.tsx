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

  const getModalData = () => {
    switch (type) {
      case 'resign':
        return {
          icon: '🏳️',
          title: 'Resign Game?',
          message:
            'Are you sure you want to resign? This will end the game immediately.',
          confirmText: 'Resign',
          confirmColor:
            'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600',
        };
      case 'abort':
        return {
          icon: '⚡',
          title: 'Abort Game?',
          message:
            'Are you sure you want to abort the game? No rating will be affected.',
          confirmText: 'Abort',
          confirmColor:
            'from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600',
        };
      default:
        return {
          icon: '❓',
          title: 'Confirm Action?',
          message: 'Are you sure?',
          confirmText: 'Confirm',
          confirmColor:
            'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600',
        };
    }
  };

  const modalData = getModalData();

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-white/20 p-6 max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">{modalData.icon}</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {modalData.title}
          </h3>
          <p className="text-gray-300 text-sm">{modalData.message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600
                       text-white font-medium py-3 px-4 rounded-lg
                       transition-all duration-300 transform hover:scale-105 active:scale-95
                       shadow-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 bg-gradient-to-r ${modalData.confirmColor}
                       text-white font-bold py-3 px-4 rounded-lg
                       transition-all duration-300 transform hover:scale-105 active:scale-95
                       shadow-lg`}
          >
            {modalData.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
