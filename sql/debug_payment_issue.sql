-- Debug script to investigate payment failure

-- 1. Check the current function definition
SELECT
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'charge_entry_fees_and_start_game';

-- 2. Check recent game rooms
SELECT
  id,
  status,
  current_players,
  entry_fee,
  entry_fees_charged,
  created_at,
  updated_at
FROM game_rooms
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check game_room_players for the most recent room
WITH recent_room AS (
  SELECT id FROM game_rooms ORDER BY created_at DESC LIMIT 1
)
SELECT
  grp.room_id,
  grp.player_id,
  grp.color,
  grp.ready,
  p.username,
  p.gold_balance,
  p.is_bot
FROM game_room_players grp
JOIN players p ON p.id = grp.player_id
WHERE grp.room_id = (SELECT id FROM recent_room);

-- 4. Check if there are any pending games with both players ready
SELECT
  gr.id as room_id,
  gr.status,
  gr.current_players,
  gr.entry_fee,
  COUNT(grp.player_id) as players_in_room,
  SUM(CASE WHEN grp.ready = TRUE THEN 1 ELSE 0 END) as ready_players
FROM game_rooms gr
LEFT JOIN game_room_players grp ON grp.room_id = gr.id
WHERE gr.status IN ('waiting', 'starting', 'blind')
GROUP BY gr.id, gr.status, gr.current_players, gr.entry_fee
ORDER BY gr.created_at DESC
LIMIT 5;

-- 5. Check gold_transactions for recent payment attempts
SELECT
  player_id,
  amount,
  transaction_type,
  description,
  game_id,
  balance_after,
  created_at
FROM gold_transactions
ORDER BY created_at DESC
LIMIT 10;
