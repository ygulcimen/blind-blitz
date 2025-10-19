-- ============================================
-- BOT CLEANUP ON PLAYER LEAVE
-- Ensures bots are removed when human players leave waiting rooms
-- ============================================

-- Function to cleanup bot players from empty or bot-only waiting rooms
CREATE OR REPLACE FUNCTION cleanup_bots_from_abandoned_rooms()
RETURNS TRIGGER AS $$
DECLARE
  room_status TEXT;
  human_player_count INTEGER;
  bot_player_count INTEGER;
BEGIN
  -- Get the room status
  SELECT status INTO room_status
  FROM game_rooms
  WHERE id = OLD.room_id;

  -- Only cleanup if room is still in 'waiting' status
  IF room_status = 'waiting' THEN
    -- Count human and bot players remaining in the room
    SELECT
      COUNT(*) FILTER (WHERE p.is_bot = FALSE),
      COUNT(*) FILTER (WHERE p.is_bot = TRUE)
    INTO human_player_count, bot_player_count
    FROM game_room_players grp
    JOIN players p ON grp.player_id = p.id
    WHERE grp.room_id = OLD.room_id;

    -- If no human players remain, remove all bot players
    IF human_player_count = 0 AND bot_player_count > 0 THEN
      DELETE FROM game_room_players grp
      WHERE grp.room_id = OLD.room_id
        AND EXISTS (
          SELECT 1 FROM players p
          WHERE p.id = grp.player_id AND p.is_bot = TRUE
        );

      RAISE NOTICE '🤖 Cleaned up % bot(s) from abandoned room %', bot_player_count, OLD.room_id;
    END IF;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run after player is deleted from game_room_players
DROP TRIGGER IF EXISTS trigger_cleanup_bots_on_player_leave ON game_room_players;

CREATE TRIGGER trigger_cleanup_bots_on_player_leave
  AFTER DELETE ON game_room_players
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_bots_from_abandoned_rooms();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION cleanup_bots_from_abandoned_rooms TO authenticated, anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bot cleanup trigger created!';
  RAISE NOTICE '🤖 Bots will be automatically removed from waiting rooms when all human players leave';
  RAISE NOTICE '🧹 This ensures bots become available for other games immediately';
END $$;
