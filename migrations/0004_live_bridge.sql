create table if not exists volt_bridge_accounts (
  login text not null,
  platform text not null,
  server text not null default '',
  broker text not null default '',
  balance double precision not null default 0,
  equity double precision not null default 0,
  margin double precision not null default 0,
  ea_version text not null default '',
  ping_ms integer not null default 0,
  last_heartbeat timestamptz not null default now(),
  connected boolean not null default true,
  primary key (login, platform)
);

create table if not exists volt_bridge_commands (
  id text primary key,
  login text not null,
  platform text not null,
  command_type text not null,
  payload_json text not null,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  completed_at timestamptz,
  result_json text
);

create index if not exists volt_bridge_commands_queue_idx
  on volt_bridge_commands (login, platform, status, created_at);

create table if not exists volt_bridge_fills (
  id text primary key,
  login text not null,
  platform text not null,
  ticket bigint not null,
  event text not null,
  symbol text not null,
  side text not null,
  lots double precision not null default 0,
  price double precision,
  profit double precision,
  payload_json text not null,
  received_at timestamptz not null default now()
);

create index if not exists volt_bridge_fills_ticket_idx
  on volt_bridge_fills (login, platform, ticket, received_at desc);
