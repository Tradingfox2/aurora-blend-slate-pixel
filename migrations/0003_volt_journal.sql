-- Journal metrics for closed trades
alter table volt_trades add column if not exists mfe double precision;
alter table volt_trades add column if not exists mae double precision;
alter table volt_trades add column if not exists duration_ms bigint;

create index if not exists volt_trades_account_idx on volt_trades (account_id);
create index if not exists volt_trades_symbol_idx on volt_trades (symbol);
