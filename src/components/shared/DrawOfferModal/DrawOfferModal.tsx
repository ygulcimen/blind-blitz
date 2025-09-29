// components/shared/DrawOfferModal/DrawOfferModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Handshake, X } from 'lucide-react';
import { Card } from '../../ui/card';

// Framer Motion button variants
const confirmButtonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    boxShadow: "0 8px 30px rgba(59, 130, 246, 0.5)",
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

interface DrawOfferModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DrawOfferModal: React.FC<DrawOfferModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative max-w-md w-full mx-auto animate-scale-in">
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl blur-2xl opacity-60 animate-pulse scale-105" />

        {/* Secondary glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />

        <Card className="relative bg-black/40 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden">
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
                🤝
              </div>
              <h1 className="text-3xl font-black mb-2 tracking-wide text-blue-100 drop-shadow-sm">
                OFFER DRAW?
              </h1>
              <p className="text-gray-200 text-lg font-medium">
                Propose a peaceful end to this battle?
              </p>
            </div>

            {/* Message */}
            <div className="bg-white/8 backdrop-blur-xl rounded-xl p-4 mb-6 border border-white/15 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Handshake size={24} className="text-blue-400" />
                <span className="text-white font-semibold">Draw Agreement</span>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">
                This will send a draw offer to your opponent. They can choose to accept or decline.
                If accepted, the game ends immediately as a draw.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={onConfirm}
                title="Offer Draw"
                variants={confirmButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Handshake size={20} />
                Offer Draw
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