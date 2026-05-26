-- Systema: backfill profiles for auth users created before 001 migration
-- Run after 001_profiles_and_trigger.sql if accounts already existed.

insert into public.profiles (id, email, locale, payment_status)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data->>'locale', 'ru'),
  coalesce(users.raw_user_meta_data->>'payment_status', 'unpaid')
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
)
on conflict (id) do nothing;
