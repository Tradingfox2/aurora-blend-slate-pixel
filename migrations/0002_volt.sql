create table if not exists volt_trades (
  id text primary key,
  ticket integer not null,
  account_id text not null,
  signal_number integer,
  source_id text,
  symbol text not null,
  side text not null,
  lots double precision not null,
  open_price double precision not null,
  close_price double precision not null,
  sl double precision,
  tp double precision,
  profit double precision not null,
  open_time timestamptz not null,
  close_time timestamptz not null,
  comment text not null default ''
);

create index if not exists volt_trades_close_time_idx on volt_trades (close_time desc);
create index if not exists volt_trades_source_idx on volt_trades (source_id);

create table if not exists volt_signals (
  id text primary key,
  number integer not null,
  source_id text not null,
  raw_text text not null,
  parsed_json text,
  status text not null,
  confidence double precision not null default 0,
  interpreter text not null,
  received_at timestamptz not null
);

create index if not exists volt_signals_number_idx on volt_signals (number desc);
