create table if not exists public.lotto_draws (
  draw_number integer primary key,
  draw_date date not null,
  numbers integer[] not null check (array_length(numbers, 1) = 6),
  bonus_number integer not null,
  first_win_count integer,
  first_prize_amount bigint,
  second_win_count integer,
  second_prize_amount bigint,
  second_total_amount bigint,
  third_win_count integer,
  third_prize_amount bigint,
  third_total_amount bigint,
  fourth_win_count integer,
  fourth_prize_amount bigint,
  fourth_total_amount bigint,
  fifth_win_count integer,
  fifth_prize_amount bigint,
  fifth_total_amount bigint,
  total_winners integer,
  total_sales_amount bigint,
  updated_at timestamptz not null default now()
);

create table if not exists public.lotto_stats (
  key text primary key,
  payload jsonb not null,
  last_computed_draw_no integer,
  updated_at timestamptz not null default now()
);

alter table public.lotto_draws enable row level security;
alter table public.lotto_stats enable row level security;

create policy "lotto_draws_public_read"
  on public.lotto_draws for select
  to anon, authenticated
  using (true);

create policy "lotto_stats_public_read"
  on public.lotto_stats for select
  to anon, authenticated
  using (true);
