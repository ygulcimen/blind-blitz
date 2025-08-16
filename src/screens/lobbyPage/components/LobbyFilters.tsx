// src/screens/LobbyPage/components/LobbyFilters.tsx
import React from 'react';
import { Search, Filter, Eye, Bot, Layers } from 'lucide-react';
import type { FilterState, GameMode } from '../types/lobby.types';

interface LobbyFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  roomCount: number;
}

export const LobbyFilters: React.FC<LobbyFiltersProps> = ({
  filters,
  onFiltersChange,
  roomCount,
}) => {
  const handleModeChange = (mode: 'all' | GameMode) => {
    onFiltersChange({ ...filters, mode });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const toggleShowFull = () => {
    onFiltersChange({ ...filters, showFull: !filters.showFull });
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by room ID or host name..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:bg-gray-800/80 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('all')}
            className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              filters.mode === 'all'
                ? 'bg-white text-black shadow-lg'
                : 'bg-gray-800/60 text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-800/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Modes</span>
            {filters.mode === 'all' && (
              <span className="bg-black/20 rounded-full px-2 py-0.5 text-xs">
                {roomCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleModeChange('classic')}
            className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              filters.mode === 'classic'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-800/60 text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-800/80'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Classic</span>
          </button>

          <button
            onClick={() => handleModeChange('robochaos')}
            className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              filters.mode === 'robochaos'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-gray-800/60 text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-800/80'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>RoboChaos</span>
          </button>
        </div>

        {/* Additional Filters */}
        <button className="bg-gray-800/60 hover:bg-gray-800/80 text-gray-400 hover:text-white px-5 py-3 rounded-xl font-medium transition-all border border-gray-700 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          <span className="bg-gray-700 rounded-full px-2 py-0.5 text-xs">
            2
          </span>
        </button>
      </div>

      {/* Secondary Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Quick Filters */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Quick filters:</span>
        </div>

        <button className="px-3 py-1.5 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 text-gray-300 text-sm transition-colors">
          Free Entry
        </button>

        <button className="px-3 py-1.5 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 text-gray-300 text-sm transition-colors">
          High Stakes
        </button>

        <button className="px-3 py-1.5 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 text-gray-300 text-sm transition-colors">
          Blitz
        </button>

        <button className="px-3 py-1.5 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 text-gray-300 text-sm transition-colors">
          My Rating
        </button>

        <div className="flex-1" />

        {/* Hide Full Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!filters.showFull}
            onChange={toggleShowFull}
            className="sr-only"
          />
          <div
            className={`w-10 h-5 rounded-full transition-colors ${
              !filters.showFull ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                !filters.showFull ? 'translate-x-5' : 'translate-x-0.5'
              } transform mt-0.5`}
            />
          </div>
          <span className="text-gray-400 text-sm">Hide full rooms</span>
        </label>

        {/* Results Count */}
        <div className="text-gray-500 text-sm">
          {roomCount} {roomCount === 1 ? 'room' : 'rooms'} found
        </div>
      </div>
    </div>
  );
};
