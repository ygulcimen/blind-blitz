// src/screens/LobbyPage/components/EmptyState.tsx
import React from 'react';
import { Search, RefreshCw, Plus, Frown } from 'lucide-react';
import type { FilterState } from '../types/lobby.types';

interface EmptyStateProps {
  filters: FilterState;
  onCreateRoom: () => void;
  onResetFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filters,
  onCreateRoom,
  onResetFilters,
}) => {
  const hasActiveFilters =
    filters.mode !== 'all' || filters.search !== '' || !filters.showFull;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center">
          {hasActiveFilters ? (
            <Search className="w-12 h-12 text-gray-600" />
          ) : (
            <Frown className="w-12 h-12 text-gray-600" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">0</span>
        </div>
      </div>

      {/* Message */}
      <h3 className="text-xl font-semibold text-white mb-2">
        {hasActiveFilters
          ? 'No rooms match your filters'
          : 'No rooms available'}
      </h3>

      <p className="text-gray-400 text-center max-w-md mb-8">
        {hasActiveFilters
          ? `We couldn't find any rooms matching "${
              filters.search || filters.mode
            }". Try adjusting your filters or create your own room.`
          : 'Be the first to create a room and start playing! Or wait a moment for new rooms to appear.'}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Reset Filters
          </button>
        )}

        <button
          onClick={onCreateRoom}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create First Room
        </button>
      </div>

      {/* Suggestions */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        <div className="text-center p-4 bg-gray-800/30 rounded-xl">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-sm text-gray-400">
            Try Quick Match for instant games
          </div>
        </div>
        <div className="text-center p-4 bg-gray-800/30 rounded-xl">
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-sm text-gray-400">Join a tournament instead</div>
        </div>
        <div className="text-center p-4 bg-gray-800/30 rounded-xl">
          <div className="text-2xl mb-2">🤖</div>
          <div className="text-sm text-gray-400">Practice against AI</div>
        </div>
      </div>
    </div>
  );
};
