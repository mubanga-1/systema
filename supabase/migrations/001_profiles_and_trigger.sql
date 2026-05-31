-- Systema: profiles table + auth.users trigger
-- Run in Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- Auth settings (configure in Dashboard, not SQL):
--   - Authentication → Providers → Email: enabled
--   - Confirm email: ON (recommended for production)
--   - Site URL: http://localhost:3000 (dev) or your production origin
--   - Redirect URLs: http://localhost:3000/**, https://your-domain.com/**
--   - Email confirm redirect should include:
--       http://localhost:3000/ru/auth/callback
--       http://localhost:3000/en/auth/callback
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  locale text not null default 'ru',
  payment_status text not null default 'unpaid',
  plan text not null default 'base',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, locale, payment_status, plan)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'locale', 'ru'),
    coalesce(new.raw_user_meta_data->>'payment_status', 'unpaid'),
    coalesce(new.raw_user_meta_data->>'plan', 'base')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
