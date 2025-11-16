-- Updated trigger that detects bot moves by checking if times were manually set
CREATE OR REPLACE FUNCTION update_player_time_on_move()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  time_elapsed_ms INTEGER;
  previous_player TEXT;
  white_time_changed BOOLEAN;
  black_time_changed BOOLEAN;
BEGIN
  -- CRITICAL: Only process actual moves, not initial clock start
  -- Check that BOTH old and new last_move_time exist (this is a move, not initial start)
  IF NEW.last_move_time IS DISTINCT FROM OLD.last_move_time
     AND OLD.last_move_time IS NOT NULL
     AND NEW.last_move_time IS NOT NULL THEN

    -- Check if either time was manually changed in the UPDATE
    -- Bot moves manually set the time, human moves don't
    white_time_changed := NEW.white_time_ms IS DISTINCT FROM OLD.white_time_ms;
    black_time_changed := NEW.black_time_ms IS DISTINCT FROM OLD.black_time_ms;

    -- Who just moved? (opposite of current turn)
    previous_player := CASE
      WHEN NEW.current_turn = 'white' THEN 'black'
      ELSE 'white'
    END;

    -- If the PREVIOUS player's time was manually set, this is a bot move - skip automatic deduction
    IF (previous_player = 'white' AND white_time_changed) OR
       (previous_player = 'black' AND black_time_changed) THEN
      RAISE NOTICE 'Bot move detected (time manually set) - skipping automatic time deduction';
      RETURN NEW;
    END IF;

    -- Calculate time elapsed for human moves
    time_elapsed_ms := EXTRACT(EPOCH FROM (NEW.last_move_time - OLD.last_move_time)) * 1000;

    -- Deduct time from player who just moved
    IF previous_player = 'white' THEN
      NEW.white_time_ms := GREATEST(0, OLD.white_time_ms - time_elapsed_ms);
    ELSE
      NEW.black_time_ms := GREATEST(0, OLD.black_time_ms - time_elapsed_ms);
    END IF;

    RAISE NOTICE 'Human move timer: % used %ms, remaining: %ms',
      previous_player, time_elapsed_ms,
      CASE WHEN previous_player = 'white' THEN NEW.white_time_ms ELSE NEW.black_time_ms END;
  ELSIF OLD.last_move_time IS NULL AND NEW.last_move_time IS NOT NULL THEN
    -- Initial clock start - don't deduct anything
    RAISE NOTICE 'Clock started at %', NEW.last_move_time;
  END IF;

  RETURN NEW;
END;
$$;
