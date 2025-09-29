// components/shared/ResignationModal/ResignationModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { Card } from '../../ui/card';

// Framer Motion button variants
const resignButtonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    boxShadow: "0 8px 30px rgba(239, 68, 68, 0.5)",
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  },
  tap: {
    scale: 0.95,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

const cancelButtonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    boxShadow: "0 8px 30px rgba(107, 114, 128, 0.5)",
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  },
  tap: {
    scale: 0.95,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

const closeButtonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  },
  tap: {
    scale: 0.9,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

interface ResignationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResignationModal: React.FC<ResignationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative max-w-md w-full mx-auto animate-scale-in">
        {/* Enhanced gradient background with warning colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl blur-2xl opacity-60 animate-pulse scale-105" />

        {/* Secondary glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur-xl" />

        <Card className="relative bg-black/40 backdrop-blur-xl border border-red-500/20 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          {/* Top-right close button */}
          <motion.button
            onClick={onCancel}
            title="Close"
            variants={closeButtonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm border border-white/10 shadow-lg flex items-center justify-center transition-all duration-200 z-10"
          >
            <X size={16} color="white" />
          </motion.button>

          <div className="relative p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 drop-shadow-lg animate-bounce">
                🏳️
              </div>
              <h1 className="text-3xl font-black mb-2 tracking-wide text-red-100 drop-shadow-sm">
                RESIGN GAME?
              </h1>
              <p className="text-gray-200 text-lg font-medium">
                Surrender this battle? This cannot be undone.
              </p>
            </div>

            {/* Warning Message */}
            <div className="bg-red-500/10 backdrop-blur-xl rounded-xl p-4 mb-6 border border-red-500/20 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle size={24} className="text-red-400" />
                <span className="text-white font-semibold">Warning</span>
              </div>
              <p className="text-red-200 text-sm leading-relaxed mb-2">
                Resigning will immediately end the game and award victory to your opponent.
              </p>
              <p className="text-red-300 text-xs">
                ⚠️ This action cannot be undone. Consider offering a draw instead.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={onConfirm}
                title="Resign Game"
                variants={resignButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl backdrop-blur-sm border border-red-400/20 shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Flag size={20} />
                Resign
              </motion.button>

              <motion.button
                onClick={onCancel}
                title="Cancel"
                variants={cancelButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-xl backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center transition-all duration-200"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};