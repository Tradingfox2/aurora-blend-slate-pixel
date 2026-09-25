alter table volt_bridge_commands
  add column if not exists connection_id text;

create index if not exists volt_bridge_commands_connection_idx
  on volt_bridge_commands (connection_id, status, created_at);
