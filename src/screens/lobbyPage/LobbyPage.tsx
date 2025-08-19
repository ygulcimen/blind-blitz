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
import { usePlayerEconomy } from '../../context/PlayerEconomyConcept';
import { lobbyService } from '../../services/lobbyService';

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = usePlayerEconomy();
  const playerGold = state.gold;

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

  // Load rooms on mount
  useEffect(() => {
    loadRooms();

    // Handle quick start from landing page
    if (searchParams.get('quickStart') === 'true') {
      setShowQuickMatch(true);
    }
  }, [searchParams]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(loadRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

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

  // Filter rooms based on current filters
  const filteredRooms = rooms.filter((room) => {
    const matchesMode = filters.mode === 'all' || room.mode === filters.mode;
    const matchesSearch =
      room.host.toLowerCase().includes(filters.search.toLowerCase()) ||
      room.id.includes(filters.search);
    const matchesFull = filters.showFull || room.players < room.maxPlayers;

    return matchesMode && matchesSearch && matchesFull;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <LobbyHeader playerGold={playerGold} />

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
          onCreateRoom={() => setShowCreateRoom(true)} // ✅ Add this line
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
                playerGold={playerGold}
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
          playerGold={playerGold}
        />
      )}
    </div>
  );
};

export default LobbyPage;
