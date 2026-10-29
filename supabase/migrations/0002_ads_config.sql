create table if not exists public.ads_config (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ads_config enable row level security;

create policy "ads_config_public_read"
  on public.ads_config for select
  to anon, authenticated
  using (true);
