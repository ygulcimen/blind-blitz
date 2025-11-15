-- Check what bots are available and their ratings/difficulties

SELECT
  username,
  rating,
  is_bot,
  bot_config->>'difficulty' as difficulty,
  bot_config->>'name' as bot_name,
  bot_config->'live_phase'->>'depth' as depth
FROM players
WHERE is_bot = TRUE
ORDER BY rating DESC;
