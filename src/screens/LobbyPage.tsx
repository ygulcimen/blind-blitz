// screens/LobbyPage.tsx - Create this new file
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface GameTable {
  id: string;
  host: string;
  hostRating: number;
  timeControl: string;
  status: 'waiting' | 'playing' | 'full';
  players: number;
  maxPlayers: number;
  created: Date;
}

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<GameTable[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [timeControl, setTimeControl] = useState('3+2');

  // Mock data for demo
  useEffect(() => {
    const mockTables: GameTable[] = [
      {
        id: '1',
        host: 'ChessMaster2024',
        hostRating: 1847,
        timeControl: '3+2',
        status: 'waiting',
        players: 1,
        maxPlayers: 2,
        created: new Date(Date.now() - 300000), // 5 mins ago
      },
      {
        id: '2',
        host: 'BlindNinja',
        hostRating: 1623,
        timeControl: '5+0',
        status: 'waiting',
        players: 1,
        maxPlayers: 2,
        created: new Date(Date.now() - 120000), // 2 mins ago
      },
      {
        id: '3',
        host: 'QueenGambit',
        hostRating: 1892,
        timeControl: '1+1',
        status: 'playing',
        players: 2,
        maxPlayers: 2,
        created: new Date(Date.now() - 600000), // 10 mins ago
      },
    ];
    setTables(mockTables);
  }, []);

  const handleCreateTable = () => {
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }

    const newTable: GameTable = {
      id: Date.now().toString(),
      host: playerName,
      hostRating: Math.floor(Math.random() * 800) + 1200, // Random rating 1200-2000
      timeControl,
      status: 'waiting',
      players: 1,
      maxPlayers: 2,
      created: new Date(),
    };

    setTables((prev) => [newTable, ...prev]);
    setShowCreateModal(false);

    // Simulate joining own table and starting game
    setTimeout(() => {
      navigate('/game');
    }, 1000);
  };

  const handleJoinTable = (tableId: string) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? { ...table, players: 2, status: 'full' as const }
          : table
      )
    );

    // Navigate to game after brief delay
    setTimeout(() => {
      navigate('/game');
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'text-green-400';
      case 'playing':
        return 'text-blue-400';
      case 'full':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return '⏳';
      case 'playing':
        return '⚔️';
      case 'full':
        return '🔒';
      default:
        return '❓';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
              Game Lobby
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Join an existing table or create your own BlindChess battle. The
            chaos awaits! ⚔️
          </p>

          {/* Quick Stats */}
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {tables.filter((t) => t.status === 'waiting').length}
              </div>
              <div className="text-sm text-gray-400">Open Tables</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {tables.filter((t) => t.status === 'playing').length}
              </div>
              <div className="text-sm text-gray-400">Active Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {tables.reduce((sum, t) => sum + t.players, 0)}
              </div>
              <div className="text-sm text-gray-400">Players Online</div>
            </div>
          </div>

          {/* Create Table Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 
                       text-white font-bold text-lg px-8 py-4 rounded-2xl 
                       transition-all duration-300 transform hover:scale-110 active:scale-95
                       shadow-2xl hover:shadow-green-500/40 border border-green-400/30
                       flex items-center space-x-3 mx-auto"
          >
            <span className="text-2xl">🎯</span>
            <span>Create New Table</span>
            <span className="text-2xl">🚀</span>
          </button>
        </div>

        {/* Game Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`
                bg-black/20 backdrop-blur-lg rounded-2xl p-6 border 
                transition-all duration-300 transform hover:scale-105
                ${
                  table.status === 'waiting'
                    ? 'border-green-500/30 hover:border-green-400/50 hover:shadow-green-500/20'
                    : table.status === 'playing'
                    ? 'border-blue-500/30 hover:border-blue-400/50 hover:shadow-blue-500/20'
                    : 'border-gray-500/30 hover:border-gray-400/50'
                }
                hover:shadow-xl
              `}
            >
              {/* Table Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">♟️</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {table.host}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>⭐ {table.hostRating}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(table.created)}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-1 ${getStatusColor(
                    table.status
                  )}`}
                >
                  <span>{getStatusIcon(table.status)}</span>
                  <span className="text-sm font-medium capitalize">
                    {table.status}
                  </span>
                </div>
              </div>

              {/* Table Info */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Time Control:</span>
                  <span className="text-white font-semibold">
                    {table.timeControl}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Players:</span>
                  <span className="text-white font-semibold">
                    {table.players}/{table.maxPlayers}
                  </span>
                </div>

                {/* Player Slots Visual */}
                <div className="flex space-x-2">
                  {Array.from({ length: table.maxPlayers }).map((_, index) => (
                    <div
                      key={index}
                      className={`
                        flex-1 h-8 rounded-lg flex items-center justify-center text-sm font-medium
                        ${
                          index < table.players
                            ? 'bg-green-600/30 text-green-400 border border-green-500/50'
                            : 'bg-gray-600/30 text-gray-500 border border-gray-500/50 border-dashed'
                        }
                      `}
                    >
                      {index < table.players ? '👤' : '⭕'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {table.status === 'waiting' ? (
                <button
                  onClick={() => handleJoinTable(table.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 
                             text-white font-bold py-3 px-4 rounded-xl 
                             transition-all duration-300 transform hover:scale-105 active:scale-95
                             shadow-lg hover:shadow-blue-500/30"
                >
                  ⚔️ Join Battle
                </button>
              ) : table.status === 'playing' ? (
                <button
                  disabled
                  className="w-full bg-gray-600/50 text-gray-400 font-medium py-3 px-4 rounded-xl cursor-not-allowed"
                >
                  🎮 Game in Progress
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-600/50 text-gray-400 font-medium py-3 px-4 rounded-xl cursor-not-allowed"
                >
                  🔒 Table Full
                </button>
              )}
            </div>
          ))}

          {/* Empty State */}
          {tables.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">🏜️</div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                No tables available
              </h3>
              <p className="text-gray-500 mb-6">
                Be the first to create a BlindChess table!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 
                           text-white font-bold px-6 py-3 rounded-xl 
                           transition-all duration-300 transform hover:scale-105"
              >
                🎯 Create Table
              </button>
            </div>
          )}
        </div>

        {/* Create Table Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                🎯 Create New Table
              </h2>

              <div className="space-y-6">
                {/* Player Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your chess name..."
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white 
                               placeholder-gray-400 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Time Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time Control
                  </label>
                  <select
                    value={timeControl}
                    onChange={(e) => setTimeControl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white 
                               focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="1+1">⚡ Bullet (1+1)</option>
                    <option value="3+2">🔥 Blitz (3+2)</option>
                    <option value="5+0">⏰ Rapid (5+0)</option>
                    <option value="10+5">🎯 Classical (10+5)</option>
                  </select>
                </div>

                {/* Info */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-blue-400 text-sm font-medium mb-2">
                    ℹ️ BlindChess Format
                  </div>
                  <ul className="text-blue-200 text-xs space-y-1">
                    <li>• 5 blind moves per player (5s each)</li>
                    <li>• Epic reveal animation</li>
                    <li>• Live chess with your time control</li>
                  </ul>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 text-white font-medium py-3 px-4 rounded-xl 
                             transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTable}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 
                             text-white font-bold py-3 px-4 rounded-xl 
                             transition-all duration-300 transform hover:scale-105 active:scale-95
                             shadow-lg hover:shadow-green-500/30"
                >
                  🚀 Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;
