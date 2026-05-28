-- Systema: invoices table
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subscription_user_id uuid,
  provider_invoice_id text,
  invoice_url text,
  amount numeric,
  currency text,
  status text,
  created_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

create policy "Users can read own invoices"
  on public.invoices
  for select
  to authenticated
  using (auth.uid() = user_id);
