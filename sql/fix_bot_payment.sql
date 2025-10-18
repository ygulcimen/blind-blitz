-- ============================================
-- FIX BOT PAYMENT - SKIP ENTRY FEES FOR BOTS
-- Bots don't need to pay entry fees
-- ============================================

CREATE OR REPLACE FUNCTION charge_entry_fees_and_start_game(room_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  room_data RECORD;
  white_player RECORD;
  black_player RECORD;
  total_pot INTEGER;
BEGIN
  SELECT * INTO room_data
  FROM game_rooms
  WHERE id = room_uuid
  FOR UPDATE;

  IF room_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'room_not_found');
  END IF;

  -- Accept BOTH 'starting' AND 'waiting' status (for bot-injected rooms)
  IF room_data.status NOT IN ('starting', 'waiting') THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'invalid_room_state',
      'current_status', room_data.status
    );
  END IF;

  -- Get white player with bot check
  SELECT p.*, grp.color, p.is_bot INTO white_player
  FROM players p
  JOIN game_room_players grp ON p.id = grp.player_id
  WHERE grp.room_id = room_uuid AND grp.color = 'white';

  -- Get black player with bot check
  SELECT p.*, grp.color, p.is_bot INTO black_player
  FROM players p
  JOIN game_room_players grp ON p.id = grp.player_id
  WHERE grp.room_id = room_uuid AND grp.color = 'black';

  -- Check gold ONLY for human players
  IF white_player.is_bot IS NULL OR white_player.is_bot = FALSE THEN
    IF white_player.gold_balance < room_data.entry_fee THEN
      RETURN jsonb_build_object('success', false, 'reason', 'white_insufficient_gold', 'player_id', white_player.id);
    END IF;
  END IF;

  IF black_player.is_bot IS NULL OR black_player.is_bot = FALSE THEN
    IF black_player.gold_balance < room_data.entry_fee THEN
      RETURN jsonb_build_object('success', false, 'reason', 'black_insufficient_gold', 'player_id', black_player.id);
    END IF;
  END IF;

  -- Deduct entry fee ONLY from human players
  IF white_player.is_bot IS NULL OR white_player.is_bot = FALSE THEN
    UPDATE players
    SET gold_balance = gold_balance - room_data.entry_fee
    WHERE id = white_player.id;

    -- Log transaction for human player
    INSERT INTO gold_transactions (player_id, amount, transaction_type, description, game_id, balance_after)
    VALUES (
      white_player.id,
      -room_data.entry_fee,
      'game_entry_fee',
      'BlindChess 5+0 Battle Entry',
      room_uuid,
      white_player.gold_balance - room_data.entry_fee
    );
  END IF;

  IF black_player.is_bot IS NULL OR black_player.is_bot = FALSE THEN
    UPDATE players
    SET gold_balance = gold_balance - room_data.entry_fee
    WHERE id = black_player.id;

    -- Log transaction for human player
    INSERT INTO gold_transactions (player_id, amount, transaction_type, description, game_id, balance_after)
    VALUES (
      black_player.id,
      -room_data.entry_fee,
      'game_entry_fee',
      'BlindChess 5+0 Battle Entry',
      room_uuid,
      black_player.gold_balance - room_data.entry_fee
    );
  END IF;

  -- Update room status to blind phase
  UPDATE game_rooms
  SET status = 'blind',
      entry_fees_charged = TRUE,
      updated_at = NOW()
  WHERE id = room_uuid;

  -- Mark both players as ready
  UPDATE game_room_players
  SET ready = TRUE
  WHERE room_id = room_uuid;

  -- Calculate total pot (bots contribute to pot even though they don't pay from their balance)
  total_pot := room_data.entry_fee * 2;

  RETURN jsonb_build_object(
    'success', true,
    'room_id', room_uuid,
    'total_pot', total_pot,
    'phase', 'blind'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'reason', 'error',
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION charge_entry_fees_and_start_game TO authenticated, anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ charge_entry_fees_and_start_game() function updated!';
  RAISE NOTICE '🤖 Bots no longer need to pay entry fees!';
  RAISE NOTICE '💰 Only human players are charged!';
END $$;
