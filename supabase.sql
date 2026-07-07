-- Execute no SQL Editor do Supabase (Database > SQL Editor)
-- Rode tudo de uma vez

-- ─── championship_state ───────────────────────────────────────────────────────
-- Estado oficial do campeonato, editável apenas pelo admin autenticado

create table if not exists championship_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz default now()
);

alter table championship_state enable row level security;

create policy "leitura publica"
  on championship_state for select
  using (true);

-- Remove policies antigas e recria restrita ao admin (app_metadata.is_admin = true)
-- IMPORTANTE: antes de rodar, adicione {"is_admin": true} no app_metadata do usuário
-- admin em Authentication > Users no painel do Supabase
drop policy if exists "escrita publica" on championship_state;
drop policy if exists "escrita autenticada" on championship_state;
drop policy if exists "escrita apenas admin" on championship_state;

create policy "escrita apenas admin"
  on championship_state for all
  using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true)
  with check ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);


-- ─── profiles ─────────────────────────────────────────────────────────────────
-- Perfil público de cada usuário (username + atlética)

create table if not exists profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  atletica text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "leitura publica profiles"
  on profiles for select using (true);

create policy "escrita propria profiles"
  on profiles for insert
  with check (auth.uid() = id);

create policy "atualizacao propria profiles"
  on profiles for update
  using (auth.uid() = id);


-- ─── simulations ──────────────────────────────────────────────────────────────
-- Palpite de cada usuário — mesmo formato do state do championship_state

create table if not exists simulations (
  user_id uuid references profiles(id) primary key,
  brackets jsonb default '{}',
  cheer jsonb default '{}',
  updated_at timestamptz default now()
);

alter table simulations enable row level security;

create policy "leitura publica simulations"
  on simulations for select using (true);

create policy "escrita propria simulations"
  on simulations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
