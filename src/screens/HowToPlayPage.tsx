import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const HowToPlayPage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'classic' | 'robochaos'>('classic');

  const classicSteps = [
    {
      number: '1',
      title: 'Blind Phase Begins',
      description: 'Both players start with 5 minutes on the clock. You must make your first 5 moves without seeing your opponent\'s moves.',
      icon: '🕶️',
      details: [
        'You can see the starting position',
        'Your moves are hidden from opponent',
        'Plan your opening strategy carefully',
        'Timer counts down during this phase',
      ],
    },
    {
      number: '2',
      title: 'Submit Your Moves',
      description: 'Plan and submit up to 5 moves. Once submitted, you cannot change them. Think strategically!',
      icon: '✅',
      details: [
        'Submit moves one at a time or all at once',
        'You can undo moves before submitting',
        'Invalid moves lose you gold rewards',
        'Valid moves earn you gold bonuses',
      ],
    },
    {
      number: '3',
      title: 'Reveal & Rewards',
      description: 'Watch the blind moves play out simultaneously. Earn gold based on move quality!',
      icon: '🎬',
      details: [
        'Valid move: +5 gold',
        'Capture bonus: +15 gold',
        'Invalid move: -5 gold penalty',
        'Opponent invalid move: +10 gold bonus',
      ],
    },
    {
      number: '4',
      title: 'Live Phase',
      description: 'Continue the game with normal chess rules. Use your remaining time wisely to secure victory!',
      icon: '⚔️',
      details: [
        'Standard chess rules apply',
        'Your remaining time continues from blind phase',
        'Win by checkmate, timeout, or resignation',
        'Winner gets blind phase rewards + remaining pot',
      ],
    },
  ];

  const robochaosSteps = [
    {
      number: '1',
      title: 'AI Takes Control',
      description: 'Instead of making moves yourself, watch as AI robots create chaotic opening positions for both sides.',
      icon: '🤖',
      details: [
        'AI makes 5 random moves for each player',
        'Completely unpredictable positions',
        'No opening theory applies',
        'Pure adaptation and calculation',
      ],
    },
    {
      number: '2',
      title: 'Chaos Unfolds',
      description: 'The robots create completely random positions that destroy traditional opening theory. Prepare for madness!',
      icon: '💥',
      details: [
        'Robots move pieces randomly',
        'No human input during this phase',
        'Creates unique positions every time',
        'Tests pure chess skill, not memorization',
      ],
    },
    {
      number: '3',
      title: 'Evaluate the Chaos',
      description: 'Analyze the resulting position quickly. The timer is running and you need to formulate a plan!',
      icon: '🧠',
      details: [
        'Assess material balance',
        'Identify tactical threats',
        'Find piece coordination',
        'Develop a winning plan',
      ],
    },
    {
      number: '4',
      title: 'Live Chess Battle',
      description: 'Play out the position with your remaining time. Adapt to the chaos and outplay your opponent!',
      icon: '⚡',
      details: [
        'Start from the chaotic position',
        'Use your time wisely',
        'Focus on tactics over theory',
        'Winner takes all the rewards',
      ],
    },
  ];

  const rewardSystem = [
    {
      icon: '✅',
      title: 'Valid Move',
      gold: '+5 Gold',
      color: 'from-green-600 to-emerald-600',
      description: 'Earn gold for each legal move you make',
    },
    {
      icon: '🎯',
      title: 'Capture Bonus',
      gold: '+15 Gold',
      color: 'from-blue-600 to-indigo-600',
      description: 'Extra reward for capturing opponent pieces',
    },
    {
      icon: '❌',
      title: 'Invalid Move',
      gold: '-5 Gold',
      color: 'from-red-600 to-rose-600',
      description: 'Penalty for illegal moves (refunded to opponent)',
    },
    {
      icon: '💰',
      title: 'Opponent Error',
      gold: '+10 Gold',
      color: 'from-yellow-600 to-amber-600',
      description: 'Bonus when opponent makes invalid move',
    },
  ];

  const tips = [
    {
      icon: '💡',
      title: 'Think Ahead',
      description: 'Plan your opening carefully. In Classic mode, your first 5 moves set up your entire strategy.',
    },
    {
      icon: '⏰',
      title: 'Manage Time',
      description: 'You have 5 minutes total. Blind phase uses time, so plan quickly but wisely.',
    },
    {
      icon: '🎯',
      title: 'Maximize Rewards',
      description: 'Focus on making valid moves and capturing pieces to earn maximum gold in blind phase.',
    },
    {
      icon: '🧩',
      title: 'Adapt in RoboChaos',
      description: 'Forget opening theory. Focus on tactical awareness and positional understanding.',
    },
    {
      icon: '🏆',
      title: 'Win Conditions',
      description: 'Victory is achieved by checkmate, timeout, or resignation. Winner gets all the rewards!',
    },
    {
      icon: '💎',
      title: 'Gold Management',
      description: 'Entry fees are paid upfront. Win to earn it back plus your rewards and the pot!',
    },
  ];

  const steps = selectedMode === 'classic' ? classicSteps : robochaosSteps;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
                How to Play
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Master the art of BlindBlitz and dominate the battlefield
            </p>
          </motion.div>

          {/* Mode Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-4 mb-16"
          >
            <button
              onClick={() => setSelectedMode('classic')}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                selectedMode === 'classic'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
              }`}
            >
              <span className="mr-2">🕶️</span>
              Classic Blind
            </button>
            <button
              onClick={() => setSelectedMode('robochaos')}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                selectedMode === 'robochaos'
                  ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/50'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
              }`}
            >
              <span className="mr-2">🤖</span>
              RoboChaos
            </button>
          </motion.div>

          {/* Game Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-6 mb-16"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl hover:border-purple-500/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-2xl ${
                        selectedMode === 'classic'
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                          : 'bg-gradient-to-br from-red-600 to-orange-600'
                      } flex items-center justify-center text-2xl font-black shadow-lg`}>
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-4xl mb-3">{step.icon}</div>
                      <h3 className="text-2xl font-black text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 ml-22">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className={`text-sm mt-1 ${
                          selectedMode === 'classic' ? 'text-blue-400' : 'text-orange-400'
                        }`}>
                          •
                        </span>
                        <span className="text-sm text-gray-400">{detail}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Reward System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-black text-center mb-8">
              <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                💰 Reward System
              </span>
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              {rewardSystem.map((reward, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/20 text-center hover:scale-105 transition-all duration-300"
                >
                  <div className="text-5xl mb-4">{reward.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{reward.title}</h3>
                  <div className={`text-2xl font-black mb-3 bg-gradient-to-r ${reward.color} bg-clip-text text-transparent`}>
                    {reward.gold}
                  </div>
                  <p className="text-sm text-gray-400">{reward.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border border-yellow-500/30 rounded-2xl p-6">
              <p className="text-center text-yellow-200/90 leading-relaxed">
                <span className="font-bold">💡 Pro Tip:</span> The total pot is split based on blind phase performance.
                Winner gets their blind rewards + remaining pot. Loser keeps their blind rewards!
              </p>
            </div>
          </motion.div>

          {/* Tips & Tricks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-black text-center mb-8">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                💎 Tips & Tricks
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{tip.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{tip.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{tip.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/20 shadow-2xl inline-block">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-3xl font-black text-white mb-4">
                Ready to Play?
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Test your skills in the ultimate chess challenge. Every move matters!
              </p>
              <Link
                to="/games"
                className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500
                           text-white font-bold py-4 px-8 rounded-2xl
                           transition-all duration-300 transform hover:scale-105 active:scale-95
                           shadow-lg hover:shadow-purple-500/50 text-lg"
              >
                Start Playing Now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayPage;
