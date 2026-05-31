import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@utils/supabase/server';
import { getBillingSnapshot, PLANS } from '@utils/supabase/billing';

function formatDate(value: string | null, locale: string) {
  if (!value) return 'Never paid';

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

export default async function BillingPage({
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
  const renewalText =
    billing.subscriptionCount === 0
      ? 'Never paid'
      : formatDate(billing.nextBillingAt, locale);

  return (
    <main className="min-h-full bg-zinc-950 px-4 py-8 pb-28 text-zinc-100">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-4 min-[608px]:flex-row min-[608px]:items-start min-[608px]:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Billing
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Subscription and plan
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              Review your current access level, renewal date, and available upgrades.
            </p>
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center justify-center rounded-full border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-300"
          >
            Back to settings
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
          <div className="grid gap-5 min-[821px]:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Current plan
              </p>
              <p className="mt-2 text-2xl font-semibold uppercase text-white">
                {PLANS[billing.plan].label}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Access
              </p>
              <p className="mt-2 text-sm text-zinc-200">{PLANS[billing.plan].access}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Next billing cycle
              </p>
              <p className="mt-2 text-sm text-zinc-200">{renewalText}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Payments made
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {billing.subscriptionCount}
              </p>
            </div>
          </div>
          <span className={`mt-6 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(billing.subscriptionStatus)}`}>
            {billing.subscriptionStatus}
          </span>
        </section>

        <section className="mt-5 grid gap-4 min-[821px]:grid-cols-3">
          {Object.values(PLANS).map((plan) => {
            const isCurrent = plan.key === billing.plan;

            return (
              <div
                key={plan.key}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{plan.label}</h2>
                    <p className="mt-2 text-sm text-zinc-300">{plan.access}</p>
                  </div>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 text-sm font-semibold text-white">
                    ${plan.amount}
                  </span>
                </div>
                <form action="/api/nowpayments/checkout" method="post" className="mt-6">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="plan" value={plan.key} />
                  <button
                    type="submit"
                    disabled={isCurrent && billing.paymentStatus.toLowerCase() === 'paid'}
                    className="w-full rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                  >
                    {isCurrent && billing.paymentStatus.toLowerCase() === 'paid'
                      ? 'Current plan'
                      : isCurrent
                      ? 'Renew plan'
                      : 'Change to this plan'}
                  </button>
                </form>
              </div>
            );
          })}
        </section>

        <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
          Plan changes are scheduled for your next billing cycle. Your current
          access stays active until then.
        </p>
      </div>
    </main>
  );
}
