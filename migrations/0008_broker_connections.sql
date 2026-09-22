create table if not exists volt_broker_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  platform text not null check (platform in ('MT5','MT4')),
  broker text not null,
  server text not null,
  login text not null,
  environment text not null default 'live' check (environment in ('demo','live')),
  credential_ciphertext text not null,
  status text not null default 'pending' check (status in ('pending','connecting','connected','error','disconnected')),
  connector_id text,
  last_error text,
  trading_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create index if not exists volt_broker_connections_user_idx
  on volt_broker_connections(user_id, created_at desc);

create unique index if not exists volt_broker_connections_user_login_idx
  on volt_broker_connections(user_id, platform, server, login);
