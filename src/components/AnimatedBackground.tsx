// src/components/AnimatedBackground.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ChessPiece {
  icon: string;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
}

const chessPieces: ChessPiece[] = [
  { icon: '♞', initialX: -100, initialY: 20, duration: 25, delay: 0 },
  { icon: '♜', initialX: -80, initialY: 60, duration: 30, delay: 3 },
  { icon: '♝', initialX: -60, initialY: 80, duration: 28, delay: 6 },
  { icon: '♛', initialX: -120, initialY: 40, duration: 35, delay: 9 },
  { icon: '♞', initialX: -90, initialY: 70, duration: 26, delay: 12 },
  { icon: '♜', initialX: -70, initialY: 30, duration: 32, delay: 15 },
];

const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Enhanced Background Orbs with Gold/Amber Tones */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-400/10 via-yellow-400/8 to-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-amber-300/8 via-orange-400/6 to-white/3 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-yellow-300/6 via-amber-200/4 to-white/2 rounded-full blur-2xl"></div>

      {/* Subtle Chess Board Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 75%, transparent 75%),
            linear-gradient(-45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 75%, transparent 75%)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 30px'
        }}
      />

      {/* Animated Floating Chess Pieces */}
      {chessPieces.map((piece, index) => (
        <motion.div
          key={index}
          className="absolute text-6xl text-amber-200/20 select-none"
          initial={{
            x: piece.initialX,
            y: `${piece.initialY}vh`,
            rotate: 0,
            opacity: 0
          }}
          animate={{
            x: ['100vw', '120vw'],
            y: [`${piece.initialY}vh`, `${piece.initialY + 10}vh`, `${piece.initialY - 5}vh`, `${piece.initialY}vh`],
            rotate: [0, 15, -10, 5, 0],
            opacity: [0, 0.6, 0.6, 0.6, 0]
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.1, 0.5, 0.9, 1]
          }}
          style={{
            filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.3))'
          }}
        >
          {piece.icon}
        </motion.div>
      ))}

      {/* Subtle Sparkle Effects */}
      <motion.div
        className="absolute top-20 left-20 w-2 h-2 bg-amber-300 rounded-full"
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1
        }}
      />
      <motion.div
        className="absolute bottom-32 right-32 w-1 h-1 bg-yellow-300 rounded-full"
        animate={{
          scale: [0, 1.5, 0],
          opacity: [0, 0.8, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 2.5
        }}
      />
      <motion.div
        className="absolute top-1/2 right-20 w-1.5 h-1.5 bg-amber-200 rounded-full"
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 0.6, 0]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: 0.5
        }}
      />
      <motion.div
        className="absolute bottom-20 left-1/3 w-1 h-1 bg-yellow-400 rounded-full"
        animate={{
          scale: [0, 1.2, 0],
          opacity: [0, 0.9, 0]
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          delay: 3
        }}
      />
    </div>
  );
};

export default AnimatedBackground;