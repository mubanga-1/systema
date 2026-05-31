-- Systema: billing state tracking

alter table public.profiles
  add column if not exists subscription_count integer not null default 0,
  add column if not exists last_paid_at timestamptz;

alter table public.profiles
  alter column plan set default 'base';

update public.profiles
set subscription_count = 0
where subscription_count is null;

comment on column public.profiles.subscription_count is 'Total number of confirmed subscription payments ever made by this user';
comment on column public.profiles.last_paid_at is 'Most recent confirmed subscription payment timestamp';

drop policy if exists "Users can upsert own subscription" on public.subscriptions;
