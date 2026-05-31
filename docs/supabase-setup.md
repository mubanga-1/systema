# Supabase setup for Systema

## 1. Environment variables

In `.env` or `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-jwt-key>
```

The app uses the **anon** key with `@supabase/ssr` in `utils/supabase/client.ts` and `utils/supabase/server.ts`.

## 2. Run the profiles migration

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Paste and run [`supabase/migrations/001_profiles_and_trigger.sql`](../supabase/migrations/001_profiles_and_trigger.sql).

This creates:

- `public.profiles` — `id`, `email`, `locale`, `payment_status` (default `unpaid`)
- RLS policy — authenticated users can read their own row
- Trigger `on_auth_user_created` — mirrors new `auth.users` rows into `profiles`

## 3. Auth settings checklist

| Setting | Recommended |
|--------|----------------|
| Email provider | Enabled |
| Confirm email | **ON** (production) |
| Site URL | `http://localhost:3000` (dev) |
| Redirect URLs | `http://localhost:3000/**` |

Add locale-specific confirm callback URLs:

- `http://localhost:3000/ru/auth/callback`
- `http://localhost:3000/en/auth/callback`

(Replace host for production.)

## 4. Sign-up metadata contract

Registration (`signUpAction`) sends:

```json
{
  "locale": "ru",
  "payment_status": "unpaid"
}
```

via `options.data` on `supabase.auth.signUp()`.

The trigger reads `raw_user_meta_data` and must keep the same keys: `locale`, `payment_status`.

## 5. User flows

### Register (confirm email ON)

1. User submits `/[locale]/register`.
2. Server creates auth user with metadata → redirect to `/[locale]/register/confirm`.
3. User clicks email link → `/[locale]/auth/callback` exchanges code → redirect to `/[locale]/checkout`.
4. Alternatively: user signs in at `/[locale]/login` → navigates to checkout manually.

### Register (confirm email OFF — dev only)

If Supabase returns a session immediately, `signUpAction` redirects straight to `/[locale]/checkout`.

## 6. Checkout and payment

`/checkout` requires an active session. It displays `payment_status` from `user.user_metadata` (later: `profiles.payment_status`).

NOWPayments checkout is wired through `/api/nowpayments/checkout` and payment
confirmation is handled by `/api/nowpayments/webhook`.

## 7. Verify

After migration and a test sign-up:

```sql
select id, email, locale, payment_status from public.profiles order by created_at desc limit 5;
```

Expect `payment_status = 'unpaid'` and `locale` matching the registration locale.

## 8. Backfill profiles for existing auth users

If you created users before running `001_profiles_and_trigger.sql`, those users
will not have matching rows in `public.profiles` because the trigger did not
exist yet.

Run [`supabase/migrations/002_backfill_profiles.sql`](../supabase/migrations/002_backfill_profiles.sql)
once after the first migration. It inserts missing profile rows for existing
`auth.users` records and leaves already-created profiles untouched.

Then verify:

```sql
select
  users.id,
  users.email,
  profiles.payment_status
from auth.users
left join public.profiles on profiles.id = users.id
order by users.created_at desc;
```

Every auth user should have a non-null `profiles.payment_status`.
