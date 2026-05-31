import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@utils/supabase/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getBillingSnapshot, PLANS } from '@utils/supabase/billing';
import { ProfileSettingsPanel } from './ProfileSettingsPanel';

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return 'Never paid';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export default async function DashboardPage({
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

  const billing = await getBillingSnapshot(user.id);
  const paymentStatus = billing.paymentStatus;

  const isPaid = paymentStatus.toLowerCase() === 'paid';
  const t = await getTranslations({ locale });
  const settingsT = await getTranslations({ locale, namespace: 'settingsPage' });
  const knownStatuses = [
    'paid',
    'unpaid',
    'active',
    'past_due',
    'canceled',
    'pending',
  ];
  const statusKey = paymentStatus.toLowerCase();
  const paymentStatusLabel = t(
    `paymentStatus.${knownStatuses.includes(statusKey) ? statusKey : 'unknown'}`
  );

  const renewalText =
    billing.subscriptionCount === 0
      ? 'Never paid'
      : formatDate(billing.nextBillingAt, locale);

  return (
    <main className="min-h-full bg-zinc-950 px-4 py-8 pb-28 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            {PLANS[billing.plan].label} / {billing.subscriptionStatus}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{t('dashboard')}</h1>
          <p className="mt-2 text-sm text-zinc-300">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <ProfileSettingsPanel
            email={user.email ?? ''}
            locale={locale}
            labels={{
              profile: settingsT('account.title'),
              logout: t('logout'),
            }}
          />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-lg">
        {isPaid ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-cyan-300">
              {t('dashboardActiveTitle')}
            </h2>
            <p className="text-sm leading-6 text-zinc-300">
              {t('dashboardActiveBody')}
            </p>
            <div className="rounded-2xl bg-zinc-900/80 px-5 py-4 text-sm text-zinc-200">
              {t('paymentPaid')}: <span className="font-semibold text-white">{paymentStatusLabel}</span>
            </div>
            <div className="grid gap-4 min-[608px]:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Plan</p>
                <p className="mt-2 text-lg font-semibold text-white">{PLANS[billing.plan].label}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Next renewal</p>
                <p className="mt-2 text-sm text-zinc-200">{renewalText}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Paid cycles</p>
                <p className="mt-2 text-lg font-semibold text-white">{billing.subscriptionCount}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 rounded-3xl border border-amber-300/20 bg-amber-100/10 p-8">
            <div>
              <h2 className="text-2xl font-semibold text-amber-200">
                {t('dashboardPaywallTitle')}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                {t('dashboardPaywallDescription')}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/checkout?plan=pro"
                className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-400"
              >
                {t('dashboardPaywallAction')}
              </Link>
              <span className="inline-flex items-center rounded-full bg-zinc-900/90 px-4 py-2 text-sm text-zinc-200">
                {t('paymentUnpaid')}: {paymentStatusLabel}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-5 min-[821px]:grid-cols-3">
        {[
          ['Content queue', 'Draft campaigns, approval states, and scheduled posts will appear here.'],
          ['Instagram bridge', 'Meta connection status, token health, and sandbox checks will appear here.'],
          ['API activity', 'Agent requests, successful publishes, and failed jobs will appear here.'],
        ].map(([title, body]) => (
          <section
            key={title}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Placeholder
            </p>
            <h2 className="mt-3 text-lg font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{body}</p>
          </section>
        ))}
      </div>
      </div>
    </main>
  );
}
