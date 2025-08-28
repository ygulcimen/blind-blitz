import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Users, Trophy, CheckCircle, AlertCircle } from 'lucide-react';
import { useModal } from '../../../context/ModalContext';
import { quickMatchService } from '../../../services/quickMatchService';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

interface QuickMatchModalProps {
  onClose: () => void;
  onMatchFound: (gameId: string) => void;
}

type MatchStage = 'searching' | 'found' | 'created' | 'error';

interface MatchResult {
  gameId: string;
  action: 'joined_existing' | 'created_new';
  message: string;
}

export const QuickMatchModal: React.FC<QuickMatchModalProps> = ({
  onClose,
  onMatchFound,
}) => {
  const { setModalOpen } = useModal();

  // State
  const [stage, setStage] = useState<MatchStage>('searching');
  const [searchTime, setSearchTime] = useState(0);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string>('');
  const [autoAcceptTimer, setAutoAcceptTimer] = useState(5);
  const { playerData, loading } = useCurrentUser(); // Get the loading state

  // Refs for cancellation
  const cancelledRef = useRef(false);
  const hasSearchedRef = useRef(false);

  // Lock scroll
  useEffect(() => {
    setModalOpen(true);
    document.body.style.overflow = 'hidden';

    return () => {
      setModalOpen(false);
      document.body.style.overflow = '';
    };
  }, [setModalOpen]);

  // Search timer
  useEffect(() => {
    if (stage !== 'searching') return;

    const timer = setInterval(() => {
      setSearchTime((prev) => prev + 0.1);
    }, 100);

    return () => clearInterval(timer);
  }, [stage]);

  // Auto-accept timer
  useEffect(() => {
    if (stage === 'found' || stage === 'created') {
      const timer = setInterval(() => {
        setAutoAcceptTimer((prev) => {
          if (prev <= 1) {
            handleAcceptMatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [stage]);

  // Main search effect
  // Main search effect
  useEffect(() => {
    const performSearch = async () => {
      // Prevent multiple searches
      if (hasSearchedRef.current) return;

      // Wait for loading to complete AND player data to exist
      if (loading || !playerData?.gold_balance) {
        if (!loading && !playerData?.gold_balance) {
          setError('Unable to load player data. Please refresh and try again.');
          setStage('error');
        }
        return;
      }

      hasSearchedRef.current = true;

      try {
        // Show searching for at least 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if cancelled during delay
        if (cancelledRef.current) return;

        const result = await quickMatchService.findQuickMatch(
          playerData.gold_balance
        );

        // Check if cancelled after service call
        if (cancelledRef.current) return;

        if (result.success && result.gameId) {
          setMatchResult({
            gameId: result.gameId,
            action: result.action as 'joined_existing' | 'created_new',
            message: result.message || '',
          });

          setStage(result.action === 'joined_existing' ? 'found' : 'created');
          setAutoAcceptTimer(5);
        } else {
          setError(result.message || 'Failed to find a match');
          setStage('error');
        }
      } catch (err) {
        if (!cancelledRef.current) {
          setError('Something went wrong. Please try again.');
          setStage('error');
        }
      }
    };

    performSearch();
  }, [playerData?.gold_balance, loading]); // Add 'loading' to dependencies

  const handleCancel = () => {
    cancelledRef.current = true;
    onClose();
  };

  const handleAcceptMatch = () => {
    if (matchResult?.gameId && !cancelledRef.current) {
      onMatchFound(matchResult.gameId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 p-6">
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Quick Match</h3>
              <p className="text-white/80 text-sm">
                {stage === 'searching' && 'Finding your opponent...'}
                {stage === 'found' && 'Match found!'}
                {stage === 'created' && 'Room created!'}
                {stage === 'error' && 'Something went wrong'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Searching State */}
          {stage === 'searching' && (
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-green-500/30 rounded-full animate-ping delay-75" />
                <div className="absolute inset-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full animate-pulse flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>

              <h4 className="text-xl font-semibold text-white mb-2">
                Searching for match...
              </h4>

              <p className="text-gray-400 mb-6">
                {searchTime.toFixed(1)}s elapsed
              </p>

              <div className="flex justify-center gap-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200" />
              </div>

              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cancel Search
              </button>
            </div>
          )}

          {/* Found Match State */}
          {stage === 'found' && matchResult && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>

              <h4 className="text-xl font-bold text-white mb-2">
                Match Found!
              </h4>
              <p className="text-gray-300 mb-6">{matchResult.message}</p>

              <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                <div className="text-sm text-gray-400 mb-2">
                  Ready to battle
                </div>
                <div className="text-white font-semibold">
                  Joining existing game...
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptMatch}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 text-white font-semibold py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Join Battle
                </button>
              </div>

              <p className="text-gray-500 text-xs mt-3">
                Auto-joining in {autoAcceptTimer}s...
              </p>
            </div>
          )}

          {/* Created Room State */}
          {stage === 'created' && matchResult && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-blue-400" />
              </div>

              <h4 className="text-xl font-bold text-white mb-2">
                Room Created!
              </h4>
              <p className="text-gray-300 mb-6">{matchResult.message}</p>

              <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                <div className="text-sm text-gray-400 mb-2">
                  Waiting for opponent
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-white font-semibold">Room is open</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptMatch}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/25 text-white font-semibold py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Enter Room
                </button>
              </div>

              <p className="text-gray-500 text-xs mt-3">
                Auto-entering in {autoAcceptTimer}s...
              </p>
            </div>
          )}

          {/* Error State */}
          {stage === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>

              <h4 className="text-xl font-bold text-white mb-2">Failed!</h4>
              <p className="text-gray-300 mb-6">{error}</p>

              <button
                onClick={handleCancel}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
