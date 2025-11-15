-- Fix the payment function - remove total_pot column update since it doesn't exist
CREATE OR REPLACE FUNCTION charge_entry_fees_and_start_game(room_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  room_data RECORD;
  white_player RECORD;
  black_player RECORD;
  total_pot INTEGER;
  v_error_message TEXT;
  v_error_state TEXT;
BEGIN
  -- Log function start
  INSERT INTO payment_debug_logs (room_id, log_level, message)
  VALUES (room_uuid, 'INFO', 'charge_entry_fees_and_start_game called');

  SELECT * INTO room_data
  FROM game_rooms
  WHERE id = room_uuid
  FOR UPDATE;

  IF room_data IS NULL THEN
    INSERT INTO payment_debug_logs (room_id, log_level, message)
    VALUES (room_uuid, 'ERROR', 'Room not found');
    RETURN jsonb_build_object('success', false, 'reason', 'room_not_found');
  END IF;

  -- Log room status
  INSERT INTO payment_debug_logs (room_id, log_level, message, room_status, entry_fee)
  VALUES (room_uuid, 'DEBUG', 'Room data loaded', room_data.status, room_data.entry_fee);

  -- Accept 'starting', 'waiting', AND 'blind' status
  IF room_data.status NOT IN ('starting', 'waiting', 'blind') THEN
    INSERT INTO payment_debug_logs (room_id, log_level, message, room_status)
    VALUES (room_uuid, 'ERROR', 'Invalid room status', room_data.status);
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

  -- Log player data
  INSERT INTO payment_debug_logs (
    room_id, log_level, message,
    white_player_id, black_player_id,
    white_gold, black_gold
  )
  VALUES (
    room_uuid, 'DEBUG', 'Players loaded',
    white_player.id, black_player.id,
    white_player.gold_balance, black_player.gold_balance
  );

  -- Check gold ONLY for human players
  IF white_player.is_bot IS NULL OR white_player.is_bot = FALSE THEN
    IF white_player.gold_balance < room_data.entry_fee THEN
      INSERT INTO payment_debug_logs (room_id, log_level, message, white_player_id, white_gold, entry_fee)
      VALUES (room_uuid, 'ERROR', 'White player insufficient gold', white_player.id, white_player.gold_balance, room_data.entry_fee);
      RETURN jsonb_build_object('success', false, 'reason', 'white_insufficient_gold', 'player_id', white_player.id);
    END IF;
  END IF;

  IF black_player.is_bot IS NULL OR black_player.is_bot = FALSE THEN
    IF black_player.gold_balance < room_data.entry_fee THEN
      INSERT INTO payment_debug_logs (room_id, log_level, message, black_player_id, black_gold, entry_fee)
      VALUES (room_uuid, 'ERROR', 'Black player insufficient gold', black_player.id, black_player.gold_balance, room_data.entry_fee);
      RETURN jsonb_build_object('success', false, 'reason', 'black_insufficient_gold', 'player_id', black_player.id);
    END IF;
  END IF;

  -- Calculate total pot
  total_pot := room_data.entry_fee * 2;

  -- Deduct entry fees from HUMAN players only
  IF white_player.is_bot IS NULL OR white_player.is_bot = FALSE THEN
    INSERT INTO payment_debug_logs (room_id, log_level, message, white_player_id)
    VALUES (room_uuid, 'DEBUG', 'Deducting gold from white player', white_player.id);

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
    INSERT INTO payment_debug_logs (room_id, log_level, message, black_player_id)
    VALUES (room_uuid, 'DEBUG', 'Deducting gold from black player', black_player.id);

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
  -- REMOVED total_pot from UPDATE since the column doesn't exist
  IF room_data.status != 'blind' THEN
    INSERT INTO payment_debug_logs (room_id, log_level, message)
    VALUES (room_uuid, 'DEBUG', 'Updating room to blind status');

    UPDATE game_rooms
    SET status = 'blind',
        entry_fees_charged = TRUE,
        updated_at = NOW()
    WHERE id = room_uuid;
  ELSE
    INSERT INTO payment_debug_logs (room_id, log_level, message)
    VALUES (room_uuid, 'DEBUG', 'Room already in blind phase');
  END IF;

  -- Mark both players as ready
  UPDATE game_room_players
  SET ready = TRUE
  WHERE room_id = room_uuid;

  INSERT INTO payment_debug_logs (room_id, log_level, message)
  VALUES (room_uuid, 'INFO', 'Payment successful');

  RETURN jsonb_build_object(
    'success', true,
    'room_id', room_uuid,
    'total_pot', total_pot,
    'phase', 'blind'
  );

EXCEPTION WHEN OTHERS THEN
  -- Get error details
  GET STACKED DIAGNOSTICS
    v_error_message = MESSAGE_TEXT,
    v_error_state = RETURNED_SQLSTATE;

  -- Log the exception
  INSERT INTO payment_debug_logs (
    room_id, log_level, message, error_code, error_detail
  )
  VALUES (
    room_uuid, 'ERROR', 'Exception in charge_entry_fees_and_start_game',
    v_error_state, v_error_message
  );

  RETURN jsonb_build_object(
    'success', false,
    'reason', 'error',
    'message', v_error_message,
    'sqlstate', v_error_state
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to all roles
GRANT EXECUTE ON FUNCTION charge_entry_fees_and_start_game TO authenticated, anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Payment function fixed!';
  RAISE NOTICE '   - Removed total_pot column update (column does not exist)';
  RAISE NOTICE '   - total_pot is still calculated and returned in response';
END $$;
