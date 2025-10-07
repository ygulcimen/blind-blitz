import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { matchmakingService } from '../../services/matchmakingService';
import { Coins, Star, Swords, Crown, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import { ModeToggle } from './components/ModeToggle';
import { StakeCard } from './components/StakeCard';

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const { playerData, loading } = useCurrentUser();

  // Search states
  const [searchingStake, setSearchingStake] = useState<number | null>(null);
  const [searchTime, setSearchTime] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'classic' | 'robochaos'>(
    'classic'
  );

  // Search timer ref
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  const stakeOptions = [
    {
      minStake: 10,
      maxStake: 24,
      tier: 'pawn' as const,
      playerCount: 156,
      displayRange: '10-24',
    },
    {
      minStake: 25,
      maxStake: 49,
      tier: 'knight' as const,
      playerCount: 200,
      displayRange: '25-49',
    },
    {
      minStake: 50,
      maxStake: 99,
      tier: 'bishop' as const,
      playerCount: 234,
      displayRange: '50-99',
    },
    {
      minStake: 100,
      maxStake: 249,
      tier: 'rook' as const,
      playerCount: 189,
      displayRange: '100-249',
    },
    {
      minStake: 250,
      maxStake: 499,
      tier: 'queen' as const,
      playerCount: 98,
      displayRange: '250-499',
    },
    {
      minStake: 500,
      maxStake: 1000,
      tier: 'king' as const,
      playerCount: 45,
      displayRange: '500+',
    },
  ];

  // Cleanup search timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimer) {
        clearInterval(searchTimer);
      }
    };
  }, [searchTimer]);

  const handleQuickMatch = async (minStake: number, maxStake: number) => {
    if (!playerData || playerData.gold_balance < minStake) {
      alert(
        `Insufficient gold! You need at least ${minStake} 🪙 to enter this arena.`
      );
      return;
    }

    setSearchingStake(minStake);
    setSearchTime(0);

    // Start search timer
    const timer = setInterval(() => {
      setSearchTime((prev) => prev + 1);
    }, 1000);
    setSearchTimer(timer);

    try {
      console.log('🎯 Starting matchmaking:', {
        minStake,
        maxStake,
        mode: selectedMode,
      });

      const result = await matchmakingService.startMatchmaking({
        mode: selectedMode,
        minEntryFee: minStake,
        maxEntryFee: maxStake,
        ratingFlexibility: 100,
      });

      // Clear timer
      if (timer) clearInterval(timer);
      setSearchTimer(null);

      if (result.success && result.roomId) {
        console.log('✅ Match found, navigating to room:', result.roomId);

        // Brief success state before navigation
        setSearchingStake(null);

        // Navigate to the room (assuming your app has this route)
        navigate(`/game/${result.roomId}`);
      } else {
        console.error('❌ Matchmaking failed:', result.message);
        setSearchingStake(null);
        alert(result.message || 'Failed to find match. Please try again.');
      }
    } catch (error) {
      console.error('💥 Matchmaking error:', error);

      // Clear timer
      if (timer) clearInterval(timer);
      setSearchTimer(null);
      setSearchingStake(null);

      alert(
        'Network error during matchmaking. Please check your connection and try again.'
      );
    }
  };

  const cancelSearch = () => {
    if (searchTimer) {
      clearInterval(searchTimer);
      setSearchTimer(null);
    }
    setSearchingStake(null);
    setSearchTime(0);

    // Optional: Call matchmaking service to cancel if needed
    // matchmakingService.cancelSearch();
  };

  // Quick join function for the bottom button
  const handleQuickJoin = () => {
    // Find the first affordable option
    const affordableOption = stakeOptions.find(
      (option) => playerData && playerData.gold_balance >= option.minStake
    );

    if (affordableOption) {
      handleQuickMatch(affordableOption.minStake, affordableOption.maxStake);
    } else {
      alert('Insufficient gold for any arena. Please earn more 🪙 first.');
    }
  };

  if (loading || !playerData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
            <Swords className="w-6 h-6 text-white" />
          </div>
          <div className="text-white text-xl font-bold">Loading Arena...</div>
          <div className="text-gray-400 text-sm mt-2">
            Preparing your battlefield
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-900/40 via-black to-purple-900/40" />

      {/* Floating chess piece silhouettes */}
      {['♞', '♛', '♜', '♝'].map((piece, i) => (
        <motion.div
          key={i}
          className="absolute text-white/5 text-7xl select-none pointer-events-none"
          style={{ top: `${20 * i + 10}%`, left: `${15 * i + 5}%` }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 10 + i * 3,
            ease: 'easeInOut',
          }}
        >
          {piece}
        </motion.div>
      ))}

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 relative z-10 backdrop-blur-md bg-black/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Swords className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl">BlindBlitz Arena</h1>
              <p className="text-gray-400 text-xs">Lightning-Fast Battles</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-gray-900/80 rounded-lg px-3 py-1.5 text-sm">
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-bold">
                {playerData.gold_balance?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-blue-400" />
              <span>{playerData.rating || 1200}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-3 py-1.5 text-sm shadow-md">
            <div className="w-5 h-5 bg-blue-500 rounded text-xs font-bold flex items-center justify-center">
              {playerData.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="font-semibold">{playerData.username}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto flex flex-col gap-10 relative z-10">
        <ModeToggle
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
        />

        {/* Stake Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {stakeOptions.map((option, i) => (
            <motion.div
              key={`${option.tier}-${option.minStake}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <StakeCard
                minStake={option.minStake}
                maxStake={option.maxStake}
                displayRange={option.displayRange}
                tier={option.tier}
                playerCount={option.playerCount}
                canAfford={playerData.gold_balance >= option.minStake}
                isSearching={searchingStake === option.minStake}
                onQuickMatch={() =>
                  handleQuickMatch(option.minStake, option.maxStake)
                }
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom decorative section */}
        <motion.div
          className="flex flex-col items-center gap-4 text-center text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
          <div className="text-2xl font-bold text-white tracking-wide drop-shadow-lg">
            Welcome to the Arena
          </div>
          <p className="max-w-xl text-sm text-gray-400">
            Choose your battlefield tier. Each arena represents a different gold
            entry level — rise through the ranks and prove your skill.
            Matchmaking is fast, fair, and blind.
          </p>
          <button
            onClick={handleQuickJoin}
            disabled={searchingStake !== null}
            className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" /> Quick Join
          </button>
        </motion.div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {searchingStake && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900/95 rounded-2xl p-8 text-center border border-gray-700 shadow-2xl max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Close button */}
              <button
                onClick={cancelSearch}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Loading animation */}
              <div className="relative mb-6">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Swords className="w-6 h-6 text-blue-400" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Finding Match...
              </h3>
              <p className="text-gray-400 mb-6">
                Searching for opponents in the{' '}
                <span className="text-yellow-400 font-semibold">
                  {
                    stakeOptions.find((opt) => opt.minStake === searchingStake)
                      ?.displayRange
                  }
                </span>{' '}
                🪙 range
              </p>

              {/* Timer */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {Math.floor(searchTime / 60)}:
                  {(searchTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-500">Search time</div>
              </div>

              {/* Game mode indicator */}
              <div className="mb-6 flex items-center justify-center gap-2 text-sm">
                <div
                  className={`px-3 py-1 rounded-lg ${
                    selectedMode === 'classic'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  {selectedMode === 'classic'
                    ? '👁️ Classic Blind'
                    : '🤖 RoboChaos'}
                </div>
              </div>

              {/* Cancel button */}
              <button
                onClick={cancelSearch}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors"
              >
                Cancel Search
              </button>

              {/* Tips */}
              <div className="mt-4 text-xs text-gray-500">
                💡 Tip: Higher stake arenas typically have faster matching
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LobbyPage;
