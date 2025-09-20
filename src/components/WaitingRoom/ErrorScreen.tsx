// components/WaitingRoom/ErrorScreen.tsx
import React from 'react';

interface ErrorScreenProps {
  error: string | null;
  onReturnToLobby: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  error,
  onReturnToLobby,
}) => {
  return (
    <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <div className="text-2xl font-bold mb-2 text-red-400">
          {error || 'Room Not Found'}
        </div>
        <div className="text-gray-400 mb-6">
          {error || 'This battle arena no longer exists'}
        </div>
        <button
          onClick={onReturnToLobby}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Return to Lobby
        </button>
      </div>
    </div>
  );
};
