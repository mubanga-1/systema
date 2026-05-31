import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@utils/supabase/server';
import { redirect, Link } from '@/i18n/navigation';
import { signOutAction } from '../logout/actions';
import { CheckoutClient } from './CheckoutClient';
import { getBillingSnapshot } from '@utils/supabase/billing';

const PLANS = {
  base: {
    key: 'base',
    labelKey: 'homeCarousel.slides.3.tiers.0.name',
    detailKey: 'homeCarousel.slides.3.tiers.0.detail',
    amount: 29,
  },
  pro: {
    key: 'pro',
    labelKey: 'homeCarousel.slides.3.tiers.1.name',
    detailKey: 'homeCarousel.slides.3.tiers.1.detail',
    amount: 79,
  },
  vanguard: {
    key: 'vanguard',
    labelKey: 'homeCarousel.slides.3.tiers.2.name',
    detailKey: 'homeCarousel.slides.3.tiers.2.detail',
    amount: 299,
  },
} as const;

type PlanKey = keyof typeof PLANS;

function resolvePlan(value: string | undefined): PlanKey {
  const normalized = String(value ?? 'pro').toLowerCase();
  return normalized in PLANS ? (normalized as PlanKey) : 'pro';
}

export default async function CheckoutPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string; status?: string }>;
}>) {
  const { locale } = await params;
  const { plan: planParam, status } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/login', locale: locale as 'ru' | 'en' });
    return;
  }

  const billing = await getBillingSnapshot(user.id);
  const paymentStatus = billing.paymentStatus;

  const planKey = resolvePlan(planParam);
  const t = await getTranslations({ locale });

  const statusMessage =
    status === 'success'
      ? t('checkoutPaymentSuccess')
      : status === 'cancel'
      ? t('checkoutPaymentCancelled')
      : null;

  if (paymentStatus.toLowerCase() === 'paid') {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t('checkout')}</h1>
            <p className="mt-2 text-sm text-zinc-600">{t('checkoutDescription')}</p>
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

        <div className="mt-8 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8">
          <h2 className="text-2xl font-semibold text-cyan-300">{t('paymentPaid')}</h2>
          <p className="mt-3 text-sm text-zinc-300">
            {t('checkoutAlreadyPaid')}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-cyan-400"
            >
              {t('dashboard')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <CheckoutClient
      locale={locale}
      initialPlanKey={planKey}
      statusMessage={statusMessage}
      paymentStatus={paymentStatus}
      plans={PLANS}
      signOutAction={signOutAction}
    />
  );
}
