create table if not exists volt_bridge_state (
  login text not null,
  platform text not null,
  positions_json text not null default '[]',
  orders_json text not null default '[]',
  updated_at timestamptz not null default now(),
  primary key (login, platform)
);
