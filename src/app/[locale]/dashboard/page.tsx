import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { DashboardProfileCard } from '@/components/DashboardProfileCard';
import { createClient } from '@utils/supabase/server';
import { getBillingSnapshot, PLANS } from '@utils/supabase/billing';
import { ProfileSettingsPanel } from './ProfileSettingsPanel';

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return 'Never paid';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'paid' || normalized === 'active') {
    return 'text-emerald-400';
  }

  if (normalized === 'past_due' || normalized === 'unpaid') {
    return 'text-amber-400';
  }

  return 'text-zinc-300';
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
  const t = await getTranslations({ locale });
  const settingsT = await getTranslations({ locale, namespace: 'settingsPage' });
  const paymentStatus = billing.paymentStatus;
  const isPaid = paymentStatus.toLowerCase() === 'paid';
  const subscriptionTier = PLANS[billing.plan].label;
  const renewalText =
    billing.subscriptionCount === 0
      ? 'Never paid'
      : formatDate(billing.nextBillingAt, locale);
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

  return (
    <main className="min-h-full bg-zinc-950 px-4 py-8 pb-28 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-4 min-[608px]:flex-row min-[608px]:items-start min-[608px]:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              {subscriptionTier} / {billing.subscriptionStatus}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {t('dashboard')}
            </h1>
            <p className="mt-2 text-sm text-zinc-300">{user.email}</p>
          </div>
          <ProfileSettingsPanel
            email={user.email ?? ''}
            locale={locale}
            labels={{
              profile: settingsT('account.title'),
              logout: t('logout'),
            }}
          />
        </div>

        <div className="mt-8">
          <DashboardProfileCard
            email={user.email ?? ''}
            tier={subscriptionTier}
            renewalDate={billing.nextBillingAt ? renewalText : null}
            paymentStatus={paymentStatus}
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {isPaid ? (
              <section className="rounded-2xl border border-emerald-200/20 bg-emerald-950/30 p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-emerald-500/20 p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-emerald-200">
                      {t('dashboardActiveTitle')}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      {t('dashboardActiveBody')}
                    </p>
                    <p className="mt-4 rounded-lg bg-emerald-900/30 px-3 py-2 text-sm text-emerald-200">
                      Next renewal:{' '}
                      <span className="font-semibold">{renewalText}</span>
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-amber-200/20 bg-amber-950/30 p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-amber-500/20 p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-amber-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-amber-200">
                      {t('dashboardPaywallTitle')}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      {t('dashboardPaywallDescription')}
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Link
                        href="/checkout?plan=pro"
                        className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-400"
                      >
                        {t('dashboardPaywallAction')}
                      </Link>
                      <span className="inline-flex items-center rounded-full bg-zinc-900/90 px-4 py-2 text-sm text-zinc-200">
                        {t('paymentUnpaid')}: {paymentStatusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-zinc-700/50 bg-zinc-900/30 p-6">
              <h2 className="text-lg font-semibold text-white">Quick actions</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {isPaid ? (
                  <>
                    {[
                      'Create campaign',
                      'Schedule post',
                      'View analytics',
                      'Automation settings',
                    ].map((action) => (
                      <button
                        key={action}
                        type="button"
                        className="rounded-lg bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/30"
                      >
                        {action}
                      </button>
                    ))}
                  </>
                ) : (
                  <p className="col-span-2 text-sm text-zinc-400">
                    Upgrade to unlock automation features
                  </p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-zinc-700/50 bg-zinc-900/30 p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-white">Billing</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-zinc-400">Current plan</span>
                  <span className="font-semibold text-cyan-300">
                    {subscriptionTier}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-zinc-400">Status</span>
                  <span className={`font-semibold ${statusClass(paymentStatus)}`}>
                    {paymentStatusLabel}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-zinc-400">Next renewal</span>
                  <span className="font-semibold text-zinc-200">
                    {renewalText}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-zinc-400">Paid cycles</span>
                  <span className="font-semibold text-zinc-200">
                    {billing.subscriptionCount}
                  </span>
                </div>
                <div className="my-4 border-t border-zinc-700" />
                <Link
                  href={isPaid ? '/settings' : '/checkout'}
                  className="block rounded-lg bg-cyan-500 px-4 py-2 text-center text-sm font-semibold text-white shadow transition hover:bg-cyan-400"
                >
                  {isPaid ? 'Manage subscription' : 'Upgrade now'}
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-700/50 bg-zinc-900/30 p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-white">Need help?</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Check our documentation or contact support if you have questions.
              </p>
              <div className="mt-4 space-y-2">
                <Link
                  href="/support"
                  className="block text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  Support
                </Link>
                <Link
                  href="/billing"
                  className="block text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  Billing details
                </Link>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-5 grid gap-5 min-[821px]:grid-cols-3">
          {[
            [
              'Content queue',
              'Draft campaigns, approval states, and scheduled posts will appear here.',
            ],
            [
              'Instagram bridge',
              'Meta connection status, token health, and sandbox checks will appear here.',
            ],
            [
              'API activity',
              'Agent requests, successful publishes, and failed jobs will appear here.',
            ],
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
