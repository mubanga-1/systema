import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@utils/supabase/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { signOutAction } from '../logout/actions';
import { DashboardProfileCard } from '@/components/DashboardProfileCard';

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('payment_status')
    .eq('id', user.id)
    .single();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, current_period_end, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const paymentStatus =
    (profile?.payment_status as string | undefined) ??
    (user.user_metadata?.payment_status as string | undefined) ??
    'unpaid';

  const isPaid = paymentStatus.toLowerCase() === 'paid';
  const subscriptionTier = (subscription?.plan as string | undefined)?.toUpperCase() ?? 'PRO';
  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;
  const t = await getTranslations({ locale });

  return (
    <main className="mx-auto max-w-5xl p-8">
      {/* Header with title and logout */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-400">Manage your Systema account and subscription</p>
        </div>
        <form action={signOutAction}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="rounded-full border border-zinc-600 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-400 hover:bg-zinc-800/50"
          >
            {t('logout')}
          </button>
        </form>
      </div>

      {/* Profile Card */}
      <div className="mb-8">
        <DashboardProfileCard
          email={user.email || ''}
          tier={subscriptionTier}
          renewalDate={renewalDate}
          paymentStatus={paymentStatus}
        />
      </div>

      {/* Main content grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column - Subscription status */}
        <div className="lg:col-span-2 space-y-6">
          {isPaid ? (
            <div className="rounded-2xl border border-emerald-200/20 bg-emerald-950/30 p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-emerald-500/20 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-emerald-200">
                    {t('dashboardActiveTitle')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {t('dashboardActiveBody')}
                  </p>
                  {renewalDate && (
                    <p className="mt-4 rounded-lg bg-emerald-900/30 px-3 py-2 text-sm text-emerald-200">
                      Next renewal: <span className="font-semibold">{renewalDate}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200/20 bg-amber-950/30 p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-amber-500/20 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-amber-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-amber-200">
                    {t('dashboardPaywallTitle')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {t('dashboardPaywallDescription')}
                  </p>
                  <Link
                    href="/checkout?plan=pro"
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-400"
                  >
                    {t('dashboardPaywallAction')}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/30 p-6">
            <h3 className="text-lg font-semibold text-white">Quick actions</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {isPaid ? (
                <>
                  <button className="rounded-lg bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/30">
                    Create campaign
                  </button>
                  <button className="rounded-lg bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/30">
                    Schedule post
                  </button>
                  <button className="rounded-lg bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/30">
                    View analytics
                  </button>
                  <button className="rounded-lg bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/30">
                    Automation settings
                  </button>
                </>
              ) : (
                <p className="col-span-2 text-sm text-zinc-400">Upgrade to unlock automation features</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Billing & Info */}
        <div className="space-y-6">
          {/* Billing Card */}
          <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/30 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white">Billing</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Current plan</span>
                <span className="font-semibold text-cyan-300">{subscriptionTier}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Status</span>
                <span
                  className={`font-semibold ${
                    isPaid ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isPaid ? 'Active' : 'Inactive'}
                </span>
              </div>
              {renewalDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Renews</span>
                  <span className="font-semibold text-zinc-200">{renewalDate}</span>
                </div>
              )}
              <div className="my-4 border-t border-zinc-700" />
              {isPaid ? (
                <Link
                  href="/settings"
                  className="block rounded-lg bg-cyan-500/20 px-4 py-2 text-center text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/30"
                >
                  Manage subscription
                </Link>
              ) : (
                <Link
                  href="/checkout"
                  className="block rounded-lg bg-cyan-500 px-4 py-2 text-center text-sm font-semibold text-white shadow transition hover:bg-cyan-400"
                >
                  Upgrade now
                </Link>
              )}
            </div>
          </div>

          {/* Support Card */}
          <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/30 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white">Need help?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Check our documentation or contact support if you have questions.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="#"
                className="block text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                → Documentation
              </a>
              <a
                href="#"
                className="block text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                → Contact support
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
