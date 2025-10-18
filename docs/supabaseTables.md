### blind_phase_rewards

create table public.blind_phase_rewards (
id uuid not null default gen_random_uuid (),
game_id uuid null,
player_id uuid null,
move_number integer not null,
move_type text not null,
gold_amount integer not null,
entry_fee integer not null,
move_from text null,
move_to text null,
move_san text null,
created_at timestamp with time zone null default now(),
description text null,
constraint blind_phase_rewards_pkey primary key (id),
constraint blind_phase_rewards_game_id_player_id_move_number_key unique (game_id, player_id, move_number),
constraint blind_phase_rewards_game_id_fkey foreign KEY (game_id) references game_rooms (id) on delete CASCADE,
constraint blind_phase_rewards_player_id_fkey foreign KEY (player_id) references players (id) on delete CASCADE,
constraint blind_phase_rewards_move_type_check check (
(
move_type = any (
array[
'valid'::text,
'invalid'::text,
'capture'::text,
'opponent_bonus'::text,
'calculated_total'::text
]
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_blind_rewards_game on public.blind_phase_rewards using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_blind_rewards_player on public.blind_phase_rewards using btree (player_id) TABLESPACE pg_default;

###

### bot_game_stats

create table public.bot_game_stats (
id uuid not null default extensions.uuid_generate_v4 (),
game_id uuid null,
player_id uuid null,
bot_id uuid null,
difficulty character varying(20) not null,
player_color character varying(10) null,
result character varying(20) null,
moves_count integer null,
duration_seconds integer null,
player_rating_before integer null,
player_rating_after integer null,
gold_earned integer null,
created_at timestamp with time zone null default now(),
constraint bot_game_stats_pkey primary key (id),
constraint bot_game_stats_bot_id_fkey foreign KEY (bot_id) references bot_players (id) on delete CASCADE,
constraint bot_game_stats_game_id_fkey foreign KEY (game_id) references game_rooms (id) on delete CASCADE,
constraint bot_game_stats_player_id_fkey foreign KEY (player_id) references players (id) on delete CASCADE,
constraint bot_game_stats_player_color_check check (
(
(player_color)::text = any (
(
array[
'white'::character varying,
'black'::character varying
]
)::text[]
)
)
),
constraint bot_game_stats_result_check check (
(
(result)::text = any (
(
array[
'player_win'::character varying,
'bot_win'::character varying,
'draw'::character varying
]
)::text[]
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_bot_game_stats_player on public.bot_game_stats using btree (player_id) TABLESPACE pg_default;

create index IF not exists idx_bot_game_stats_bot on public.bot_game_stats using btree (bot_id) TABLESPACE pg_default;

create index IF not exists idx_bot_game_stats_difficulty on public.bot_game_stats using btree (difficulty) TABLESPACE pg_default;

create index IF not exists idx_bot_game_stats_created on public.bot_game_stats using btree (created_at desc) TABLESPACE pg_default;

create trigger trigger_update_bot_stats
after INSERT on bot_game_stats for EACH row
execute FUNCTION update_bot_stats ();

###

### bot_leaderboard This is a view that you created as

CREATE OR REPLACE VIEW bot_leaderboard AS
SELECT
bp.id,
bp.name,
bp.username,
bp.difficulty,
bp.rating,
bp.games_played,
bp.wins,
bp.losses,
bp.draws,
CASE
WHEN bp.games_played > 0
THEN ROUND((bp.wins::NUMERIC / bp.games_played::NUMERIC) \* 100, 2)
ELSE 0
END as win_rate,
bp.avatar_emoji,
bp.tagline
FROM bot_players bp
WHERE bp.is_active = TRUE
ORDER BY bp.rating DESC;

##

### bot_players

create table public.bot_players (
id uuid not null default extensions.uuid_generate_v4 (),
name character varying(100) not null,
username character varying(100) not null,
difficulty character varying(20) not null,
rating integer not null,
avatar_emoji text null default '🤖'::text,
tagline text null,
engine_config jsonb null default '{"depth": 10, "thinkTime": 3000, "randomness": 0.1}'::jsonb,
games_played integer null default 0,
wins integer null default 0,
losses integer null default 0,
draws integer null default 0,
is_active boolean null default true,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint bot_players_pkey primary key (id),
constraint bot_players_username_key unique (username),
constraint bot_players_difficulty_check check (
(
(difficulty)::text = any (
(
array[
'easy'::character varying,
'medium'::character varying,
'hard'::character varying,
'expert'::character varying,
'robochaos'::character varying
]
)::text[]
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_bot_players_difficulty on public.bot_players using btree (difficulty) TABLESPACE pg_default;

create index IF not exists idx_bot_players_rating on public.bot_players using btree (rating) TABLESPACE pg_default;

create index IF not exists idx_bot_players_active on public.bot_players using btree (is_active) TABLESPACE pg_default;

###

###

current_game_State is also a view and its unrestricted marked.

###

### game_blind_moves

create table public.bot_players (
id uuid not null default extensions.uuid_generate_v4 (),
name character varying(100) not null,
username character varying(100) not null,
difficulty character varying(20) not null,
rating integer not null,
avatar_emoji text null default '🤖'::text,
tagline text null,
engine_config jsonb null default '{"depth": 10, "thinkTime": 3000, "randomness": 0.1}'::jsonb,
games_played integer null default 0,
wins integer null default 0,
losses integer null default 0,
draws integer null default 0,
is_active boolean null default true,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint bot_players_pkey primary key (id),
constraint bot_players_username_key unique (username),
constraint bot_players_difficulty_check check (
(
(difficulty)::text = any (
(
array[
'easy'::character varying,
'medium'::character varying,
'hard'::character varying,
'expert'::character varying,
'robochaos'::character varying
]
)::text[]
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_bot_players_difficulty on public.bot_players using btree (difficulty) TABLESPACE pg_default;

create index IF not exists idx_bot_players_rating on public.bot_players using btree (rating) TABLESPACE pg_default;

create index IF not exists idx_bot_players_active on public.bot_players using btree (is_active) TABLESPACE pg_default;

###

### game_Draw_offers

create table public.game_draw_offers (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone null default now(),
game_id uuid not null,
offering_player text not null,
is_active boolean not null default true,
responded_at timestamp with time zone null,
accepted boolean null,
constraint game_draw_offers_pkey primary key (id),
constraint game_draw_offers_game_id_fkey foreign KEY (game_id) references game_live_state (game_id),
constraint game_draw_offers_offering_player_check check (
(
offering_player = any (array['white'::text, 'black'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_game_draw_offers_game_id on public.game_draw_offers using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_game_draw_offers_active on public.game_draw_offers using btree (game_id, is_active) TABLESPACE pg_default;

###

### game_live_moves

create table public.game_live_moves (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone null default now(),
game_id uuid not null,
move_number integer not null,
player_color text not null,
player_id uuid not null,
move_from text not null,
move_to text not null,
move_san text not null,
move_fen text not null,
is_check boolean not null default false,
is_checkmate boolean not null default false,
is_draw boolean not null default false,
time_taken_ms integer not null default 0,
time_remaining_ms integer not null default 0,
constraint game_live_moves_pkey primary key (id),
constraint game_live_moves_game_id_move_number_key unique (game_id, move_number),
constraint game_live_moves_player_id_fkey foreign KEY (player_id) references players (id),
constraint game_live_moves_player_color_check check (
(
player_color = any (array['white'::text, 'black'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_game_id on public.game_live_moves using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_move_number on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

create index IF not exists idx_live_moves_game_order on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

###

### game_live_state

create table public.game_live_moves (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone null default now(),
game_id uuid not null,
move_number integer not null,
player_color text not null,
player_id uuid not null,
move_from text not null,
move_to text not null,
move_san text not null,
move_fen text not null,
is_check boolean not null default false,
is_checkmate boolean not null default false,
is_draw boolean not null default false,
time_taken_ms integer not null default 0,
time_remaining_ms integer not null default 0,
constraint game_live_moves_pkey primary key (id),
constraint game_live_moves_game_id_move_number_key unique (game_id, move_number),
constraint game_live_moves_player_id_fkey foreign KEY (player_id) references players (id),
constraint game_live_moves_player_color_check check (
(
player_color = any (array['white'::text, 'black'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_game_id on public.game_live_moves using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_move_number on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

create index IF not exists idx_live_moves_game_order on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

###

### game_room_players

create table public.game_live_moves (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone null default now(),
game_id uuid not null,
move_number integer not null,
player_color text not null,
player_id uuid not null,
move_from text not null,
move_to text not null,
move_san text not null,
move_fen text not null,
is_check boolean not null default false,
is_checkmate boolean not null default false,
is_draw boolean not null default false,
time_taken_ms integer not null default 0,
time_remaining_ms integer not null default 0,
constraint game_live_moves_pkey primary key (id),
constraint game_live_moves_game_id_move_number_key unique (game_id, move_number),
constraint game_live_moves_player_id_fkey foreign KEY (player_id) references players (id),
constraint game_live_moves_player_color_check check (
(
player_color = any (array['white'::text, 'black'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_game_id on public.game_live_moves using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_move_number on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

create index IF not exists idx_live_moves_game_order on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

###

### game_rooms

create table public.game_live_moves (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone null default now(),
game_id uuid not null,
move_number integer not null,
player_color text not null,
player_id uuid not null,
move_from text not null,
move_to text not null,
move_san text not null,
move_fen text not null,
is_check boolean not null default false,
is_checkmate boolean not null default false,
is_draw boolean not null default false,
time_taken_ms integer not null default 0,
time_remaining_ms integer not null default 0,
constraint game_live_moves_pkey primary key (id),
constraint game_live_moves_game_id_move_number_key unique (game_id, move_number),
constraint game_live_moves_player_id_fkey foreign KEY (player_id) references players (id),
constraint game_live_moves_player_color_check check (
(
player_color = any (array['white'::text, 'black'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_game_id on public.game_live_moves using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_move_number on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

create index IF not exists idx_live_moves_game_order on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

###

### game_Status

this is a view

###

### games

create table public.game_live_moves (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone null default now(),
game_id uuid not null,
move_number integer not null,
player_color text not null,
player_id uuid not null,
move_from text not null,
move_to text not null,
move_san text not null,
move_fen text not null,
is_check boolean not null default false,
is_checkmate boolean not null default false,
is_draw boolean not null default false,
time_taken_ms integer not null default 0,
time_remaining_ms integer not null default 0,
constraint game_live_moves_pkey primary key (id),
constraint game_live_moves_game_id_move_number_key unique (game_id, move_number),
constraint game_live_moves_player_id_fkey foreign KEY (player_id) references players (id),
constraint game_live_moves_player_color_check check (
(
player_color = any (array['white'::text, 'black'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_game_id on public.game_live_moves using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_move_number on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

create index IF not exists idx_live_moves_game_order on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

###

### gold_transactions

create table public.game_live_moves (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone null default now(),
game_id uuid not null,
move_number integer not null,
player_color text not null,
player_id uuid not null,
move_from text not null,
move_to text not null,
move_san text not null,
move_fen text not null,
is_check boolean not null default false,
is_checkmate boolean not null default false,
is_draw boolean not null default false,
time_taken_ms integer not null default 0,
time_remaining_ms integer not null default 0,
constraint game_live_moves_pkey primary key (id),
constraint game_live_moves_game_id_move_number_key unique (game_id, move_number),
constraint game_live_moves_player_id_fkey foreign KEY (player_id) references players (id),
constraint game_live_moves_player_color_check check (
(
player_color = any (array['white'::text, 'black'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_game_id on public.game_live_moves using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_move_number on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

create index IF not exists idx_live_moves_game_order on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

###

### player_presence

create table public.game_live_moves (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone null default now(),
game_id uuid not null,
move_number integer not null,
player_color text not null,
player_id uuid not null,
move_from text not null,
move_to text not null,
move_san text not null,
move_fen text not null,
is_check boolean not null default false,
is_checkmate boolean not null default false,
is_draw boolean not null default false,
time_taken_ms integer not null default 0,
time_remaining_ms integer not null default 0,
constraint game_live_moves_pkey primary key (id),
constraint game_live_moves_game_id_move_number_key unique (game_id, move_number),
constraint game_live_moves_player_id_fkey foreign KEY (player_id) references players (id),
constraint game_live_moves_player_color_check check (
(
player_color = any (array['white'::text, 'black'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_game_id on public.game_live_moves using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_move_number on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

create index IF not exists idx_live_moves_game_order on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

###

### players

create table public.game_live_moves (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone null default now(),
game_id uuid not null,
move_number integer not null,
player_color text not null,
player_id uuid not null,
move_from text not null,
move_to text not null,
move_san text not null,
move_fen text not null,
is_check boolean not null default false,
is_checkmate boolean not null default false,
is_draw boolean not null default false,
time_taken_ms integer not null default 0,
time_remaining_ms integer not null default 0,
constraint game_live_moves_pkey primary key (id),
constraint game_live_moves_game_id_move_number_key unique (game_id, move_number),
constraint game_live_moves_player_id_fkey foreign KEY (player_id) references players (id),
constraint game_live_moves_player_color_check check (
(
player_color = any (array['white'::text, 'black'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_game_id on public.game_live_moves using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_game_live_moves_move_number on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

create index IF not exists idx_live_moves_game_order on public.game_live_moves using btree (game_id, move_number) TABLESPACE pg_default;

###
