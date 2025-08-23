// src/screens/LobbyPage/LobbyPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LobbyHeader } from './components/LobbyHeader';
import { QuickMatchCard } from './components/QuickMatchCard';
import { LobbyFilters } from './components/LobbyFilters';
import { RoomCard } from './components/RoomCard';
import { EmptyState } from './components/EmptyState';
import { QuickMatchModal } from './components/QuickMatchModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import type { GameRoom, FilterState } from './types/lobby.types';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { lobbyService } from '../../services/lobbyService';

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { playerData, loading: userLoading } = useCurrentUser(); // ✅ Use real user data

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // State Management
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    mode: 'all',
    search: '',
    ratingRange: 'all',
    showFull: true,
  });

  // Modal States
  const [showQuickMatch, setShowQuickMatch] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  // Use real player gold from database
  const playerGold = playerData?.gold_balance || 0;

  // ✅ DEFINE FUNCTIONS AFTER ALL STATE BUT BEFORE useEffect
  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await lobbyService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) return;

      if (playerGold < room.entryFee) {
        // Show insufficient funds notification
        alert(
          `Insufficient gold! You need ${room.entryFee} gold but only have ${playerGold}.`
        );
        return;
      }

      await lobbyService.joinRoom(roomId);
      navigate(`/game/${roomId}`);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleCreateRoom = async (config: any) => {
    try {
      const roomId = await lobbyService.createRoom(config);
      navigate(`/game/${roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleQuickMatch = async () => {
    setShowQuickMatch(true);
  };

  const handleLeaveRoom = async () => {
    try {
      const currentRoom = await lobbyService.getCurrentUserRoom();
      if (currentRoom) {
        await lobbyService.leaveRoom(currentRoom.id);
        console.log('Left room successfully!');
        // Refresh the rooms list
        loadRooms();
      } else {
        console.log('Not in any room');
      }
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  };

  // Filter rooms based on current filters
  const filteredRooms = rooms.filter((room) => {
    const matchesMode = filters.mode === 'all' || room.mode === filters.mode;
    const matchesSearch =
      room.host.toLowerCase().includes(filters.search.toLowerCase()) ||
      room.id.includes(filters.search);
    const matchesFull = filters.showFull || room.players < room.maxPlayers;

    return matchesMode && matchesSearch && matchesFull;
  });

  // ✅ ALL useEffect HOOKS AFTER FUNCTION DEFINITIONS
  // Load rooms on mount
  useEffect(() => {
    if (!playerData) return; // Don't load rooms if no player data yet

    loadRooms();

    // Handle quick start from landing page
    if (searchParams.get('quickStart') === 'true') {
      setShowQuickMatch(true);
    }
  }, [searchParams, playerData]);

  // Real-time updates
  useEffect(() => {
    if (!playerData) return; // Don't start interval if no player data yet

    const interval = setInterval(loadRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [playerData]);

  // ✅ NOW CONDITIONAL RETURNS AFTER ALL HOOKS
  // Show loading state while user data loads
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-white font-black text-2xl">BC</span>
          </div>
          <div className="text-white text-xl font-bold mb-2">
            Loading your warrior profile...
          </div>
          <div className="text-gray-400">Preparing the battlefield</div>
        </div>
      </div>
    );
  }

  // Show error state if user data failed to load
  if (!playerData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-black text-2xl">⚠️</span>
          </div>
          <div className="text-red-400 text-xl font-bold mb-2">
            Error loading player data
          </div>
          <div className="text-gray-400 mb-4">
            Please refresh the page and try again
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section - Now shows REAL user data */}
        <LobbyHeader />

        {/* Quick Match Card */}
        <QuickMatchCard
          onQuickMatch={handleQuickMatch}
          onlineCount={rooms.reduce((acc, room) => acc + room.players, 0)}
        />

        {/* Filters Section */}
        <LobbyFilters
          filters={filters}
          onFiltersChange={setFilters}
          roomCount={filteredRooms.length}
          onCreateRoom={() => setShowCreateRoom(true)}
        />

        {/* Rooms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800/50 rounded-xl h-48" />
              </div>
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onJoin={handleJoinRoom}
                playerGold={playerGold} // ✅ Now uses real gold
              />
            ))}
          </div>
        ) : (
          <EmptyState
            filters={filters}
            onCreateRoom={() => setShowCreateRoom(true)}
            onResetFilters={() =>
              setFilters({
                mode: 'all',
                search: '',
                ratingRange: 'all',
                showFull: true,
              })
            }
          />
        )}
      </div>

      {/* Modals */}
      {showQuickMatch && (
        <QuickMatchModal
          onClose={() => setShowQuickMatch(false)}
          onMatchFound={(gameId) => navigate(`/game/${gameId}`)}
        />
      )}

      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreate={handleCreateRoom}
          playerGold={playerGold} // ✅ Now uses real gold
        />
      )}
    </div>
  );
};

export default LobbyPage;
