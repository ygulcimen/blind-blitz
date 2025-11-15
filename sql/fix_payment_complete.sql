-- Complete fix for payment processing
-- Combines: race condition fix + proper gold_transactions schema + bot support
-- This addresses the issue where payments fail with generic "error" message

CREATE OR REPLACE FUNCTION charge_entry_fees_and_start_game(room_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  room_data RECORD;
  white_player RECORD;
  black_player RECORD;
  total_pot INTEGER;
BEGIN
  RAISE NOTICE '💰 charge_entry_fees_and_start_game called for room: %', room_uuid;

  SELECT * INTO room_data
  FROM game_rooms
  WHERE id = room_uuid
  FOR UPDATE;

  IF room_data IS NULL THEN
    RAISE NOTICE '❌ Room not found: %', room_uuid;
    RETURN jsonb_build_object('success', false, 'reason', 'room_not_found');
  END IF;

  RAISE NOTICE '📊 Room status: %, players: %', room_data.status, room_data.current_players;

  -- Accept 'starting', 'waiting', AND 'blind' status (for race condition where game already started)
  IF room_data.status NOT IN ('starting', 'waiting', 'blind') THEN
    RAISE NOTICE '❌ Invalid room status: %', room_data.status;
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

  RAISE NOTICE '👥 White player: % (bot: %), Black player: % (bot: %)',
    white_player.username, white_player.is_bot, black_player.username, black_player.is_bot;

  -- Check gold ONLY for human players
  IF white_player.is_bot IS NULL OR white_player.is_bot = FALSE THEN
    RAISE NOTICE '💰 White player gold: %, entry fee: %', white_player.gold_balance, room_data.entry_fee;
    IF white_player.gold_balance < room_data.entry_fee THEN
      RAISE NOTICE '❌ White player insufficient gold';
      RETURN jsonb_build_object('success', false, 'reason', 'white_insufficient_gold', 'player_id', white_player.id);
    END IF;
  END IF;

  IF black_player.is_bot IS NULL OR black_player.is_bot = FALSE THEN
    RAISE NOTICE '💰 Black player gold: %, entry fee: %', black_player.gold_balance, room_data.entry_fee;
    IF black_player.gold_balance < room_data.entry_fee THEN
      RAISE NOTICE '❌ Black player insufficient gold';
      RETURN jsonb_build_object('success', false, 'reason', 'black_insufficient_gold', 'player_id', black_player.id);
    END IF;
  END IF;

  -- Calculate total pot BEFORE deductions
  total_pot := room_data.entry_fee * 2;
  RAISE NOTICE '💰 Total pot: %', total_pot;

  -- Deduct entry fees from HUMAN players only
  IF white_player.is_bot IS NULL OR white_player.is_bot = FALSE THEN
    RAISE NOTICE '💸 Deducting % from white player', room_data.entry_fee;
    UPDATE players
    SET gold_balance = gold_balance - room_data.entry_fee
    WHERE id = white_player.id;

    -- Log the transaction for white player with required columns
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
    RAISE NOTICE '💸 Deducting % from black player', room_data.entry_fee;
    UPDATE players
    SET gold_balance = gold_balance - room_data.entry_fee
    WHERE id = black_player.id;

    -- Log the transaction for black player with required columns
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

  -- Update room status to 'blind' ONLY if it's not already 'blind'
  -- This prevents double-updating when both players pay simultaneously
  IF room_data.status != 'blind' THEN
    UPDATE game_rooms
    SET status = 'blind',
        entry_fees_charged = TRUE,
        total_pot = total_pot,
        updated_at = NOW()
    WHERE id = room_uuid;
    RAISE NOTICE '✅ Room status updated to blind';
  ELSE
    RAISE NOTICE '✅ Room already in blind phase, payment processed successfully';
  END IF;

  -- Mark both players as ready
  UPDATE game_room_players
  SET ready = TRUE
  WHERE room_id = room_uuid;

  RAISE NOTICE '✅ Payment successful! Total pot: %, game starting', total_pot;

  RETURN jsonb_build_object(
    'success', true,
    'room_id', room_uuid,
    'total_pot', total_pot,
    'phase', 'blind'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '💥 Exception in charge_entry_fees_and_start_game: % - %', SQLSTATE, SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'reason', 'error',
    'message', SQLERRM,
    'sqlstate', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to all roles
GRANT EXECUTE ON FUNCTION charge_entry_fees_and_start_game TO authenticated, anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ charge_entry_fees_and_start_game() function updated with complete fix!';
  RAISE NOTICE '   - Race condition fix: accepts blind status';
  RAISE NOTICE '   - Proper gold_transactions schema: includes game_id and balance_after';
  RAISE NOTICE '   - Bot support: skips gold deduction for bots';
END $$;
