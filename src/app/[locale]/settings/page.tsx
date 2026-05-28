import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@utils/supabase/server';
import { signOutAction } from '../logout/actions';
import { ChangePasswordForm } from './ChangePasswordForm';
import { AccountResetPasswordForm } from './AccountResetPasswordForm';

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return '-';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'paid' || normalized === 'active') {
    return 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100';
  }

  if (normalized === 'past_due' || normalized === 'unpaid') {
    return 'border-amber-300/40 bg-amber-300/10 text-amber-100';
  }

  return 'border-zinc-500/40 bg-zinc-500/10 text-zinc-100';
}

export default async function SettingsPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const [{ data: profile }, { data: subscription }, { data: invoices }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('payment_status, locale, created_at')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('subscriptions')
        .select('plan, status, current_period_end, created_at')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('invoices')
        .select('invoice_url, amount, currency, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

  const t = await getTranslations({ locale, namespace: 'settingsPage' });
  const commonT = await getTranslations({ locale });
  const paymentStatus =
    (profile?.payment_status as string | undefined) ??
    (user.user_metadata?.payment_status as string | undefined) ??
    'unpaid';
  const plan = (subscription?.plan as string | undefined) ?? 'pro';
  const subscriptionStatus =
    (subscription?.status as string | undefined) ?? paymentStatus;
  const invoiceRows = invoices ?? [];
  const translatedStatus = (status: string) => {
    const key = status.toLowerCase();
    const knownStatuses = [
      'paid',
      'unpaid',
      'active',
      'past_due',
      'canceled',
      'pending',
    ];

    return commonT(
      `paymentStatus.${knownStatuses.includes(key) ? key : 'unknown'}`
    );
  };

  const sectionClass = 'rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6';
  const labelClass = 'text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300';
  const mutedClass = 'text-sm leading-6 text-zinc-300';

  return (
    <main className="min-h-full bg-zinc-950 px-4 py-8 pb-28 text-zinc-100 min-[821px]:pb-32">
      <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 min-[608px]:flex-row min-[608px]:items-start min-[608px]:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white drop-shadow-sm">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-200">
            {t('subtitle')}
          </p>
        </div>
        <form action={signOutAction}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="rounded-full border border-cyan-200/70 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(34,211,238,0.12)] transition hover:bg-cyan-400/25"
          >
            {t('signOut')}
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-5 min-[821px]:grid-cols-[1.2fr_0.8fr]">
        <section className={sectionClass}>
          <p className={labelClass}>{t('account.title')}</p>
          <div className="mt-5 grid gap-4 min-[608px]:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">{t('account.email')}</p>
              <p className="mt-1 break-all text-base font-medium text-white">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">{t('account.language')}</p>
              <p className="mt-1 text-base font-medium uppercase text-white">
                {(profile?.locale as string | undefined) ?? locale}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">{t('account.joined')}</p>
              <p className="mt-1 text-base font-medium text-white">
                {formatDate(user.created_at, locale)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">{t('account.profileStatus')}</p>
              <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(paymentStatus)}`}>
                {translatedStatus(paymentStatus)}
              </span>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={labelClass}>{t('subscription.title')}</p>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold uppercase text-white">{plan}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {t('subscription.renewal', {
                  date: formatDate(subscription?.current_period_end, locale),
                })}
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(subscriptionStatus)}`}>
              {translatedStatus(subscriptionStatus)}
            </span>
          </div>
          <div className="mt-6 flex flex-col gap-3 min-[608px]:flex-row">
            <Link
              href="/checkout?plan=pro"
              className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400"
            >
              {t('subscription.manage')}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-300"
            >
              {t('subscription.dashboard')}
            </Link>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={labelClass}>{t('api.title')}</p>
          <p className={`mt-3 ${mutedClass}`}>{t('api.description')}</p>
          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <div className="flex flex-col gap-3 min-[608px]:flex-row min-[608px]:items-center min-[608px]:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{t('api.keyStatus')}</p>
                <p className="mt-1 font-mono text-xs text-zinc-500">sk_live_************</p>
              </div>
              <button
                type="button"
                disabled
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-500"
              >
                {t('api.generate')}
              </button>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={labelClass}>{t('instagram.title')}</p>
          <p className={`mt-3 ${mutedClass}`}>{t('instagram.description')}</p>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <div>
              <p className="text-sm font-semibold text-white">{t('instagram.status')}</p>
              <p className="mt-1 text-xs text-zinc-500">{t('instagram.mode')}</p>
            </div>
            <span className="rounded-full border border-zinc-600 px-3 py-1 text-xs font-semibold text-zinc-300">
              {t('comingSoon')}
            </span>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={labelClass}>{t('publishing.title')}</p>
          <div className="mt-5 grid gap-4 min-[608px]:grid-cols-2">
            {[
              t('publishing.approval'),
              t('publishing.postingWindow'),
              t('publishing.timezone'),
              t('publishing.brandVoice'),
            ].map((item) => (
              <label
                key={item}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200"
              >
                <span>{item}</span>
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 accent-cyan-400"
                />
              </label>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <p className={labelClass}>{t('notifications.title')}</p>
          <div className="mt-5 space-y-3">
            {[
              t('notifications.payments'),
              t('notifications.posts'),
              t('notifications.apiErrors'),
            ].map((item) => (
              <label
                key={item}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200"
              >
                <span>{item}</span>
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="h-4 w-4 accent-cyan-400"
                />
              </label>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <p className={labelClass}>{t('security.title')}</p>
          <p className={`mt-3 ${mutedClass}`}>{t('security.description')}</p>
          <ChangePasswordForm
            labels={{
              currentPassword: t('security.currentPassword'),
              newPassword: commonT('newPassword'),
              confirmPassword: commonT('confirmPassword'),
              submit: t('security.changePassword'),
              success: t('security.changeSuccess'),
              passwordMismatch: commonT('passwordMismatch'),
              invalidCurrentPassword: t('security.invalidCurrentPassword'),
              changeError: t('security.changeError'),
            }}
          />
          <div className="mt-5 flex flex-col gap-3 min-[608px]:flex-row">
            <AccountResetPasswordForm
              locale={locale}
              labels={{
                submit: t('security.forgotPassword'),
                success: t('security.resetEmailSent'),
                error: t('security.resetEmailError'),
              }}
            />
            <button
              type="button"
              disabled
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-500"
            >
              {t('security.sessions')}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-rose-400/30 bg-rose-950/30 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
            {t('danger.title')}
          </p>
          <p className={`mt-3 ${mutedClass}`}>{t('danger.description')}</p>
          <button
            type="button"
            disabled
            className="mt-5 rounded-full border border-rose-300/30 px-4 py-2 text-sm font-semibold text-rose-200 opacity-60"
          >
            {t('danger.delete')}
          </button>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
        <p className={labelClass}>{t('invoices.title')}</p>
        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800">
          {invoiceRows.length > 0 ? (
            invoiceRows.map((invoice) => (
              <div
                key={`${invoice.invoice_url}-${invoice.created_at}`}
                className="grid gap-2 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 last:border-b-0 min-[608px]:grid-cols-[1fr_120px_120px]"
              >
                <span>{formatDate(invoice.created_at, locale)}</span>
                <span className="uppercase">
                  {invoice.amount ?? '-'} {invoice.currency ?? ''}
                </span>
                <span>{translatedStatus(invoice.status ?? 'pending')}</span>
              </div>
            ))
          ) : (
            <p className="bg-zinc-900/50 px-4 py-4 text-sm text-zinc-400">
              {t('invoices.empty')}
            </p>
          )}
        </div>
      </section>
      </div>
    </main>
  );
}
