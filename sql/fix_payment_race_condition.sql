-- Fix payment race condition where second player can't pay when room status is already 'blind'
-- The issue: When both players are ready simultaneously, first player's payment changes room to 'blind'
-- before second player's payment can complete, causing 'invalid_room_state' error

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

  -- Calculate total pot
  total_pot := room_data.entry_fee * 2;
  RAISE NOTICE '💰 Total pot: %', total_pot;

  -- Deduct entry fees from HUMAN players only
  IF white_player.is_bot IS NULL OR white_player.is_bot = FALSE THEN
    RAISE NOTICE '💸 Deducting % from white player', room_data.entry_fee;
    UPDATE players
    SET gold_balance = gold_balance - room_data.entry_fee
    WHERE id = white_player.id;

    -- Log the transaction for white player
    INSERT INTO gold_transactions (player_id, amount, transaction_type, description)
    VALUES (white_player.id, -room_data.entry_fee, 'game_entry_fee', 'Entry fee for game ' || room_uuid);
  END IF;

  IF black_player.is_bot IS NULL OR black_player.is_bot = FALSE THEN
    RAISE NOTICE '💸 Deducting % from black player', room_data.entry_fee;
    UPDATE players
    SET gold_balance = gold_balance - room_data.entry_fee
    WHERE id = black_player.id;

    -- Log the transaction for black player
    INSERT INTO gold_transactions (player_id, amount, transaction_type, description)
    VALUES (black_player.id, -room_data.entry_fee, 'Entry fee for game ' || room_uuid);
  END IF;

  -- Update room status to 'blind' ONLY if it's not already 'blind'
  -- This prevents double-updating when both players pay simultaneously
  IF room_data.status != 'blind' THEN
    UPDATE game_rooms
    SET status = 'blind',
        total_pot = total_pot,
        updated_at = NOW()
    WHERE id = room_uuid;
    RAISE NOTICE '✅ Room status updated to blind';
  ELSE
    RAISE NOTICE '✅ Room already in blind phase, payment processed successfully';
  END IF;

  RAISE NOTICE '✅ Payment successful!';
  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Error in charge_entry_fees_and_start_game: %', SQLERRM;
  RETURN jsonb_build_object('success', false, 'reason', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to all roles
GRANT EXECUTE ON FUNCTION charge_entry_fees_and_start_game TO authenticated, anon;
