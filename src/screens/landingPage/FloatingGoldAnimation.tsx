import React from 'react';
import { motion } from 'framer-motion';

const FloatingGoldAnimation: React.FC = () => {
  const coins = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 4,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {coins.map((coin) => (
        <motion.div
          key={coin.id}
          initial={{ y: '100vh', x: `${coin.x}vw`, opacity: 0, rotate: 0 }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.6, 0.6, 0],
            rotate: 360,
          }}
          transition={{
            duration: coin.duration,
            delay: coin.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute text-2xl"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))',
          }}
        >
          🪙
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingGoldAnimation;
