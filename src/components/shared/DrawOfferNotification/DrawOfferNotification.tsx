// components/shared/DrawOfferNotification/DrawOfferNotification.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, X, Clock } from 'lucide-react';
import { Card } from '../../ui/card';

// Framer Motion variants
const notificationVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: -50
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const acceptButtonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    boxShadow: "0 8px 30px rgba(34, 197, 94, 0.5)",
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  },
  tap: {
    scale: 0.95,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

const declineButtonVariants = {
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

interface DrawOfferNotificationProps {
  isVisible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onDismiss?: () => void;
  timeoutSeconds?: number;
}

export const DrawOfferNotification: React.FC<DrawOfferNotificationProps> = ({
  isVisible,
  onAccept,
  onDecline,
  onDismiss,
  timeoutSeconds = 30,
}) => {
  const [countdown, setCountdown] = useState(timeoutSeconds);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(timeoutSeconds);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onDismiss?.();
          return timeoutSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, timeoutSeconds, onDismiss]);

  const handleAccept = () => {
    onAccept();
    setCountdown(timeoutSeconds);
  };

  const handleDecline = () => {
    onDecline();
    setCountdown(timeoutSeconds);
  };

  const handleDismiss = () => {
    onDismiss?.();
    setCountdown(timeoutSeconds);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-sm w-full"
          variants={notificationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Enhanced gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl blur-lg opacity-60 animate-pulse scale-105" />

          {/* Secondary glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur-md" />

          <Card className="relative bg-black/50 backdrop-blur-xl border border-amber-400/30 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            {/* Close button */}
            <motion.button
              onClick={handleDismiss}
              title="Dismiss"
              variants={closeButtonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="absolute top-3 right-3 w-6 h-6 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm border border-white/10 shadow-lg flex items-center justify-center transition-all duration-200 z-10"
            >
              <X size={12} color="white" />
            </motion.button>

            <div className="relative p-4">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-500/20 rounded-full">
                  <Handshake size={20} className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm">Draw Offer</h3>
                  <p className="text-amber-200 text-xs">Your opponent offers a draw</p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-white/10 rounded-lg border border-white/10">
                <Clock size={14} className="text-amber-400" />
                <span className="text-amber-200 text-xs font-medium">
                  Auto-dismiss in {countdown}s
                </span>
                <div className="ml-auto w-16 h-1 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-linear"
                    style={{
                      width: `${(countdown / timeoutSeconds) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  onClick={handleAccept}
                  title="Accept Draw"
                  variants={acceptButtonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-xs rounded-lg backdrop-blur-sm border border-green-400/20 shadow-lg transition-all duration-200"
                >
                  Accept
                </motion.button>

                <motion.button
                  onClick={handleDecline}
                  title="Decline Draw"
                  variants={declineButtonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xs rounded-lg backdrop-blur-sm border border-red-400/20 shadow-lg transition-all duration-200"
                >
                  Decline
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};