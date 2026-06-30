-- Execute no SQL Editor do Supabase (Database > SQL Editor)

create table if not exists championship_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz default now()
);

-- Row Level Security: leitura pública, escrita pública
-- Ajuste as políticas se quiser restringir edição a usuários autenticados
alter table championship_state enable row level security;

create policy "leitura publica"
  on championship_state for select
  using (true);

create policy "escrita publica"
  on championship_state for all
  using (true)
  with check (true);
