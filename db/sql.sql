create table rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references auth.users(id),
  status text not null default 'pending',
  map_state jsonb,
  current_turn uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

create table room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  color text,
  score integer default 0,
  joined_at timestamp with time zone default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  correct_answer text not null,
  options jsonb,
  category text,
  difficulty text
);

create table attacks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  attacker_id uuid references auth.users(id),
  defender_id uuid references auth.users(id),
  territory text,
  question_id uuid references questions(id),
  attacker_answer text,
  attacker_time float,
  defender_answer text,
  defender_time float,
  winner_id uuid references auth.users(id),
  resolved_at timestamp with time zone
);