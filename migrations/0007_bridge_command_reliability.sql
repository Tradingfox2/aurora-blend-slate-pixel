alter table volt_bridge_commands
  add column if not exists last_error text,
  add column if not exists attempt_count integer not null default 0,
  add column if not exists lease_until timestamptz;

create index if not exists volt_bridge_commands_lease_idx
  on volt_bridge_commands (login, platform, status, lease_until);
