// src/screens/TournamentsPage.tsx
import React, { useState } from 'react';

interface Tournament {
  id: string;
  name: string;
  description: string;
  prizePool: number;
  entryFee: number;
  players: number;
  maxPlayers: number;
  status: 'live' | 'upcoming' | 'registration';
  mode: 'classical' | 'robochaos' | 'mixed';
  timeControl: string;
  startTime?: string;
  duration: string;
}

const TournamentsPage: React.FC = () => {
  const [filter, setFilter] = useState<
    'all' | 'live' | 'upcoming' | 'registration'
  >('all');

  const tournaments: Tournament[] = [
    {
      id: '1',
      name: 'Weekend Blitz Championship',
      description:
        'Fast-paced tournament with 5-minute games. Classical mode only.',
      prizePool: 50000,
      entryFee: 500,
      players: 124,
      maxPlayers: 200,
      status: 'live',
      mode: 'classical',
      timeControl: '5+3',
      duration: '3 hours',
    },
    {
      id: '2',
      name: 'Chaos Masters Elite',
      description:
        'RoboChaos-only tournament for experienced players. Expect the unexpected.',
      prizePool: 100000,
      entryFee: 1000,
      players: 67,
      maxPlayers: 100,
      status: 'upcoming',
      mode: 'robochaos',
      timeControl: '10+5',
      startTime: '2h 15m',
      duration: '4 hours',
    },
    {
      id: '3',
      name: 'Golden Ladder Monthly',
      description:
        'Mixed mode tournament with escalating rewards. Swiss system format.',
      prizePool: 75000,
      entryFee: 750,
      players: 89,
      maxPlayers: 128,
      status: 'registration',
      mode: 'mixed',
      timeControl: '15+10',
      startTime: 'Tomorrow 8 PM',
      duration: '6 hours',
    },
    {
      id: '4',
      name: "Beginner's Cup",
      description:
        'Entry-level tournament for new players. Lower stakes, great learning experience.',
      prizePool: 15000,
      entryFee: 100,
      players: 156,
      maxPlayers: 256,
      status: 'registration',
      mode: 'classical',
      timeControl: '10+5',
      startTime: 'Sunday 2 PM',
      duration: '4 hours',
    },
  ];

  const filteredTournaments = tournaments.filter(
    (tournament) => filter === 'all' || tournament.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'text-green-400 bg-green-500/20';
      case 'upcoming':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'registration':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'classical':
        return 'text-blue-400 bg-blue-500/20';
      case 'robochaos':
        return 'text-purple-400 bg-purple-500/20';
      case 'mixed':
        return 'text-orange-400 bg-orange-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-gray-400 text-sm">Compete for glory</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Tournaments
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto">
            Join competitive tournaments and compete for massive gold prizes.
            Test your skills against the best BlindChess players worldwide.
          </p>
        </div>

        {/* Tournament Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">240K</div>
            <div className="text-gray-400 text-sm">Total Prize Pool</div>
          </div>

          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-blue-400 mb-1">436</div>
            <div className="text-gray-400 text-sm">Active Players</div>
          </div>

          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-green-400 mb-1">1</div>
            <div className="text-gray-400 text-sm">Live Now</div>
          </div>

          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">⏰</div>
            <div className="text-2xl font-bold text-purple-400 mb-1">3</div>
            <div className="text-gray-400 text-sm">Upcoming</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-1 backdrop-blur-sm">
            {(['all', 'live', 'upcoming', 'registration'] as const).map(
              (filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 capitalize ${
                    filter === filterOption
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {filterOption === 'all' ? 'All Tournaments' : filterOption}
                </button>
              )
            )}
          </div>
        </div>

        {/* Tournament Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {filteredTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-colors"
            >
              {/* Tournament Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                      tournament.status
                    )}`}
                  >
                    {tournament.status === 'live' && '🔴 '}
                    {tournament.status}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getModeColor(
                      tournament.mode
                    )}`}
                  >
                    {tournament.mode}
                  </div>
                </div>
                {tournament.startTime && (
                  <div className="text-gray-400 text-sm">
                    {tournament.status === 'upcoming'
                      ? 'Starts in '
                      : 'Starts '}
                    {tournament.startTime}
                  </div>
                )}
              </div>

              {/* Tournament Info */}
              <h3 className="text-2xl font-bold text-white mb-3">
                {tournament.name}
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {tournament.description}
              </p>

              {/* Tournament Stats Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Prize Pool</div>
                  <div className="text-yellow-400 font-bold text-lg flex items-center gap-1">
                    🪙 {tournament.prizePool.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Entry Fee</div>
                  <div className="text-white font-semibold text-lg flex items-center gap-1">
                    <span>🪙</span>
                    <span>{tournament.entryFee.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Players</div>
                  <div className="text-white font-semibold">
                    {tournament.players}/{tournament.maxPlayers}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (tournament.players / tournament.maxPlayers) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Format</div>
                  <div className="text-white font-semibold">
                    {tournament.timeControl}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {tournament.duration}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                disabled={tournament.players >= tournament.maxPlayers}
                className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                  tournament.players >= tournament.maxPlayers
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : tournament.status === 'live'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : tournament.status === 'upcoming'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {tournament.players >= tournament.maxPlayers
                  ? 'Tournament Full'
                  : tournament.status === 'live'
                  ? 'Watch Live'
                  : tournament.status === 'upcoming'
                  ? 'Set Reminder'
                  : 'Register Now'}
              </button>
            </div>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-gray-400 mb-4">
              No {filter !== 'all' ? filter : ''} tournaments found
            </div>
            <button
              onClick={() => setFilter('all')}
              className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View All Tournaments
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 inline-block">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Ready to Compete?
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Join a tournament and test your skills against the best players.
              Huge prizes await!
            </p>
            <button
              onClick={() => (window.location.href = '/games')}
              className="bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors mr-4"
            >
              Practice First
            </button>
            <button
              onClick={() => setFilter('registration')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Find Tournament
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentsPage;
