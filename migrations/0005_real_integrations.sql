create table if not exists volt_telegram_sessions (
  phone text primary key,
  phone_code_hash text,
  session_ciphertext text,
  session_iv text,
  session_tag text,
  status text not null default 'pending',
  username text,
  telegram_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists volt_telegram_messages (
  source_id text not null,
  telegram_message_id bigint not null,
  chat_id text not null,
  message_date timestamptz,
  text text not null,
  raw_json text,
  received_at timestamptz not null default now(),
  primary key (source_id, telegram_message_id)
);

create table if not exists volt_telegram_sources (
  source_id text primary key,
  chat_id text not null,
  title text not null default '',
  username text,
  enabled boolean not null default false,
  auto_trade boolean not null default false,
  last_message_id bigint,
  last_message_at timestamptz,
  worker_status text not null default 'disconnected',
  updated_at timestamptz not null default now()
);

alter table volt_bridge_commands add column if not exists claimed_until timestamptz;
alter table volt_bridge_commands add column if not exists attempts integer not null default 0;
alter table volt_bridge_commands add column if not exists expires_at timestamptz;
alter table volt_bridge_commands add column if not exists last_error text;

create index if not exists volt_bridge_commands_lease_idx
  on volt_bridge_commands (login, platform, status, claimed_until);
