import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@utils/supabase/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { signOutAction } from '../logout/actions';

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

  const paymentStatus =
    (profile?.payment_status as string | undefined) ??
    (user.user_metadata?.payment_status as string | undefined) ??
    'unpaid';

  const isPaid = paymentStatus.toLowerCase() === 'paid';
  const t = await getTranslations({ locale });

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('dashboard')}</h1>
          <p className="mt-2 text-sm text-zinc-600">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            {t('logout')}
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-lg">
        {isPaid ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-cyan-300">
              {t('dashboardActiveTitle')}
            </h2>
            <p className="text-sm leading-6 text-zinc-300">
              {t('dashboardActiveBody')}
            </p>
            <div className="rounded-2xl bg-zinc-900/80 px-5 py-4 text-sm text-zinc-200">
              {t('paymentPaid')}: <span className="font-semibold text-white">{paymentStatus}</span>
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
                {t('paymentUnpaid')}: {paymentStatus}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
