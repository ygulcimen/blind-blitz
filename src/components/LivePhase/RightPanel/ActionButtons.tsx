import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface ActionButtonsProps {
  onResign: () => void;
  onOfferDraw: () => void;
  onLeaveGame: () => void;
  onRematch?: () => void;
  gameEnded?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onResign,
  onOfferDraw,
  onLeaveGame,
  onRematch,
  gameEnded = false,
  disabled = false,
  className = '',
}) => {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex gap-2">
        {!gameEnded ? (
          // Active Game Buttons
          <>
            {/* Resign Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onResign}
              disabled={disabled}
              className="flex-1 border-red-500/50 hover:border-red-400 hover:bg-red-500/10 hover:shadow-red-400/20 hover:shadow-lg text-red-400 hover:text-red-300 transition-all duration-200"
              title="Resign Game"
            >
              <span className="text-lg">🏳️</span>
            </Button>

            {/* Offer Draw Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOfferDraw}
              disabled={disabled}
              className="flex-1 border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-500/10 hover:shadow-yellow-400/20 hover:shadow-lg text-yellow-400 hover:text-yellow-300 transition-all duration-200"
              title="Offer Draw"
            >
              <span className="text-lg">🤝</span>
            </Button>

            {/* Leave Game Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onLeaveGame}
              disabled={disabled}
              className="flex-1 border-gray-500/50 hover:border-gray-400 hover:bg-gray-500/10 hover:shadow-gray-400/20 hover:shadow-lg text-gray-400 hover:text-gray-300 transition-all duration-200"
              title="Leave Game"
            >
              <span className="text-lg">🚪</span>
            </Button>
          </>
        ) : (
          // Game Ended Buttons
          <>
            {/* Play Again Button */}
            {onRematch && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRematch}
                disabled={disabled}
                className="flex-1 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-500/10 hover:shadow-emerald-400/20 hover:shadow-lg text-emerald-400 hover:text-emerald-300 transition-all duration-200"
                title="Play Again"
              >
                <span className="text-lg">⚔️</span>
              </Button>
            )}

            {/* Back to Games Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onLeaveGame}
              disabled={disabled}
              className="flex-1 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 hover:shadow-purple-400/20 hover:shadow-lg text-purple-400 hover:text-purple-300 transition-all duration-200"
              title="Back to Games"
            >
              <span className="text-lg">👑</span>
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};