-- Systema: subscriptions table
-- Adds a subscriptions table to track recurring subscription state

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null,
  status text not null default 'trialing', -- trialing, active, past_due, canceled
  provider_subscription_id text,
  start_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can upsert own subscription"
  on public.subscriptions
  for insert, update
  to authenticated
  with check (auth.uid() = user_id);

-- trigger to keep updated_at in sync
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.update_updated_at();
