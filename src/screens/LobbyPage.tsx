// screens/LobbyPage.tsx - ECONOMIC REVOLUTION VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerEconomy } from '../context/PlayerEconomyConcept';

export type GameMode = 'classic' | 'robot_chaos';

export interface GameTable {
  id: string;
  host: string;
  hostRating: number;
  timeControl: string;
  gameMode: GameMode;
  entryFee: number;
  status: 'waiting' | 'playing' | 'full';
  players: number;
  maxPlayers: number;
  created: Date;
  winnerTakesAll: boolean; // If true, winner gets both entry fees
}

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const { state: economy, canAfford, deductGold } = usePlayerEconomy();

  const [tables, setTables] = useState<GameTable[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [timeControl, setTimeControl] = useState('3+2');
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('classic');
  const [entryFee, setEntryFee] = useState(50);
  const [winnerTakesAll, setWinnerTakesAll] = useState(true);

  // Mock data with economic elements
  useEffect(() => {
    const mockTables: GameTable[] = [
      {
        id: '1',
        host: 'ChessMaster2024',
        hostRating: 1847,
        timeControl: '3+2',
        gameMode: 'classic',
        entryFee: 75,
        status: 'waiting',
        players: 1,
        maxPlayers: 2,
        created: new Date(Date.now() - 300000),
        winnerTakesAll: true,
      },
      {
        id: '2',
        host: 'RobotLover99',
        hostRating: 1623,
        timeControl: '5+0',
        gameMode: 'robot_chaos',
        entryFee: 100,
        status: 'waiting',
        players: 1,
        maxPlayers: 2,
        created: new Date(Date.now() - 120000),
        winnerTakesAll: true,
      },
      {
        id: '3',
        host: 'HighRoller',
        hostRating: 1892,
        timeControl: '1+1',
        gameMode: 'classic',
        entryFee: 200,
        status: 'playing',
        players: 2,
        maxPlayers: 2,
        created: new Date(Date.now() - 600000),
        winnerTakesAll: true,
      },
      {
        id: '4',
        host: 'BudgetPlayer',
        hostRating: 1456,
        timeControl: '3+2',
        gameMode: 'classic',
        entryFee: 25,
        status: 'waiting',
        players: 1,
        maxPlayers: 2,
        created: new Date(Date.now() - 180000),
        winnerTakesAll: true,
      },
    ];
    setTables(mockTables);
  }, []);

  const getGameModeInfo = (mode: GameMode) => {
    switch (mode) {
      case 'classic':
        return {
          name: 'Classic Blind',
          icon: '🕶️',
          description: 'You control your blind moves',
          color: 'blue',
        };
      case 'robot_chaos':
        return {
          name: 'Robot Chaos',
          icon: '🤖',
          description: 'Robots make hilarious blind moves',
          color: 'purple',
        };
      default:
        return {
          name: 'Unknown',
          icon: '❓',
          description: 'Unknown game mode',
          color: 'gray',
        };
    }
  };

  const handleCreateTable = () => {
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }

    if (!canAfford(entryFee)) {
      alert(
        `You need ${entryFee} gold to create this table! Visit the bank to get a loan.`
      );
      return;
    }

    // Deduct entry fee
    const success = deductGold(
      entryFee,
      `Entry fee for ${getGameModeInfo(selectedGameMode).name} table`
    );
    if (!success) {
      alert('Failed to deduct entry fee!');
      return;
    }

    const newTable: GameTable = {
      id: Date.now().toString(),
      host: playerName,
      hostRating: Math.floor(Math.random() * 800) + 1200,
      timeControl,
      gameMode: selectedGameMode,
      entryFee,
      status: 'waiting',
      players: 1,
      maxPlayers: 2,
      created: new Date(),
      winnerTakesAll,
    };

    setTables((prev) => [newTable, ...prev]);
    setShowCreateModal(false);

    setTimeout(() => {
      navigate('/game', {
        state: {
          gameMode: selectedGameMode,
          entryFee: entryFee,
          isHost: true,
        },
      });
    }, 1000);
  };

  const handleJoinTable = (table: GameTable) => {
    if (!canAfford(table.entryFee)) {
      alert(
        `You need ${table.entryFee} gold to join this table! Current balance: ${economy.gold} gold`
      );
      return;
    }

    // Deduct entry fee
    const success = deductGold(
      table.entryFee,
      `Entry fee for ${table.host}'s ${
        getGameModeInfo(table.gameMode).name
      } game`
    );
    if (!success) {
      alert('Failed to deduct entry fee!');
      return;
    }

    setTables((prev) =>
      prev.map((t) =>
        t.id === table.id ? { ...t, players: 2, status: 'full' as const } : t
      )
    );

    setTimeout(() => {
      navigate('/game', {
        state: {
          gameMode: table.gameMode,
          entryFee: table.entryFee,
          isHost: false,
        },
      });
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

  const getEntryFeeColor = (fee: number) => {
    if (fee <= 50) return 'text-green-400';
    if (fee <= 100) return 'text-yellow-400';
    if (fee <= 200) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPotentialWinnings = (fee: number) => fee * 2; // Winner takes both entry fees

  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
              Economic Battleground
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Choose your game mode, pay your entry fee, and fight for gold! 💰
          </p>

          {/* Economic Stats */}
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
              <div className="text-2xl font-bold text-yellow-400">
                {tables.reduce((sum, t) => sum + t.entryFee * 2, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Prize Pool</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {economy.gold}
              </div>
              <div className="text-sm text-gray-400">Your Gold</div>
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
            <span className="text-2xl">💎</span>
            <span>Create Gold Table</span>
            <span className="text-2xl">🚀</span>
          </button>
        </div>

        {/* Game Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tables.map((table) => {
            const modeInfo = getGameModeInfo(table.gameMode);
            const canAffordTable = canAfford(table.entryFee);

            return (
              <div
                key={table.id}
                className={`
                  bg-black/20 backdrop-blur-lg rounded-2xl p-6 border 
                  transition-all duration-300 transform hover:scale-105
                  ${
                    table.status === 'waiting' && canAffordTable
                      ? 'border-green-500/30 hover:border-green-400/50 hover:shadow-green-500/20'
                      : table.status === 'waiting' && !canAffordTable
                      ? 'border-red-500/30 hover:border-red-400/50 hover:shadow-red-500/20 opacity-75'
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
                    <div className="text-2xl">{modeInfo.icon}</div>
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

                {/* Game Mode Badge */}
                <div
                  className={`mb-4 p-3 rounded-xl border ${
                    modeInfo.color === 'blue'
                      ? 'bg-blue-900/30 border-blue-500/30'
                      : 'bg-purple-900/30 border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-bold ${
                        modeInfo.color === 'blue'
                          ? 'text-blue-400'
                          : 'text-purple-400'
                      }`}
                    >
                      {modeInfo.name}
                    </span>
                    <span className="text-2xl">{modeInfo.icon}</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    {modeInfo.description}
                  </div>
                </div>

                {/* Economic Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Entry Fee:</span>
                    <span
                      className={`font-bold ${getEntryFeeColor(
                        table.entryFee
                      )}`}
                    >
                      {table.entryFee} 🪙
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Prize Pool:</span>
                    <span className="text-green-400 font-bold">
                      {getPotentialWinnings(table.entryFee)} 🪙
                    </span>
                  </div>

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

                  {/* Can't Afford Warning */}
                  {table.status === 'waiting' && !canAffordTable && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-2">
                      <div className="text-red-400 text-sm font-bold text-center">
                        ⚠️ Insufficient Gold!
                      </div>
                      <div className="text-red-300 text-xs text-center">
                        Need {table.entryFee - economy.gold} more gold
                      </div>
                    </div>
                  )}

                  {/* Player Slots Visual */}
                  <div className="flex space-x-2">
                    {Array.from({ length: table.maxPlayers }).map(
                      (_, index) => (
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
                      )
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {table.status === 'waiting' ? (
                  canAffordTable ? (
                    <button
                      onClick={() => handleJoinTable(table)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 
                                 text-white font-bold py-3 px-4 rounded-xl 
                                 transition-all duration-300 transform hover:scale-105 active:scale-95
                                 shadow-lg hover:shadow-blue-500/30"
                    >
                      💰 Pay {table.entryFee} Gold & Join
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/bank')}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 
                                 text-white font-bold py-3 px-4 rounded-xl 
                                 transition-all duration-300 transform hover:scale-105 active:scale-95
                                 shadow-lg hover:shadow-purple-500/30"
                    >
                      🏦 Get Loan to Join
                    </button>
                  )
                ) : table.status === 'playing' ? (
                  <button
                    disabled
                    className="w-full bg-gray-600/50 text-gray-400 font-medium py-3 px-4 rounded-xl cursor-not-allowed"
                  >
                    🎮 Gold Battle in Progress
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
            );
          })}

          {/* Empty State */}
          {tables.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">🏜️</div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                No gold tables available
              </h3>
              <p className="text-gray-500 mb-6">
                Be the first to create a profitable BlindChess table!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 
                           text-white font-bold px-6 py-3 rounded-xl 
                           transition-all duration-300 transform hover:scale-105"
              >
                💎 Create Gold Table
              </button>
            </div>
          )}
        </div>

        {/* Create Table Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                💎 Create Gold Table
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

                {/* Game Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Game Mode
                  </label>
                  <div className="space-y-2">
                    {(['classic', 'robot_chaos'] as GameMode[]).map((mode) => {
                      const info = getGameModeInfo(mode);
                      return (
                        <button
                          key={mode}
                          onClick={() => setSelectedGameMode(mode)}
                          className={`w-full p-4 rounded-xl border transition-all text-left ${
                            selectedGameMode === mode
                              ? 'border-blue-500/50 bg-blue-900/30'
                              : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{info.icon}</span>
                            <div>
                              <div className="text-white font-semibold">
                                {info.name}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {info.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Entry Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Entry Fee (Gold)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={entryFee}
                      onChange={(e) =>
                        setEntryFee(
                          Math.max(25, parseInt(e.target.value) || 25)
                        )
                      }
                      min="25"
                      max="500"
                      step="25"
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white 
                                 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400">
                      🪙
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-400">Min: 25 gold</span>
                    <span className="text-green-400">
                      Prize: {entryFee * 2} gold
                    </span>
                  </div>
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

                {/* Economic Warning */}
                {!canAfford(entryFee) && (
                  <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4">
                    <div className="text-red-400 text-sm font-medium mb-2">
                      ⚠️ Insufficient Gold!
                    </div>
                    <div className="text-red-200 text-xs">
                      You need {entryFee} gold but only have {economy.gold}{' '}
                      gold. Visit the bank to get a loan!
                    </div>
                  </div>
                )}

                {/* Economic Info */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-blue-400 text-sm font-medium mb-2">
                    💰 Economic Summary
                  </div>
                  <ul className="text-blue-200 text-xs space-y-1">
                    <li>• Entry fee: {entryFee} gold (deducted now)</li>
                    <li>
                      • Prize pool: {entryFee * 2} gold (winner takes all)
                    </li>
                    <li>• Potential profit: {entryFee} gold</li>
                    <li>• Risk: Lose your {entryFee} gold entry fee</li>
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
                  disabled={!canAfford(entryFee)}
                  className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                    canAfford(entryFee)
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white hover:shadow-green-500/30'
                      : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canAfford(entryFee) ? '💎 Create & Pay' : '🏦 Need Gold'}
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
