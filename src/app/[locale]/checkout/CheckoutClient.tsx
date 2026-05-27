'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signOutAction } from '../logout/actions';

type PlanKey = 'base' | 'pro' | 'vanguard';

interface Plan {
  key: PlanKey;
  labelKey: string;
  detailKey: string;
  amount: number;
}

interface CheckoutClientProps {
  locale: string;
  initialPlanKey: PlanKey;
  statusMessage: string | null;
  paymentStatus: string;
  plans: Record<PlanKey, Plan>;
  signOutAction: (formData: FormData) => Promise<void>;
}

export function CheckoutClient({
  locale,
  initialPlanKey,
  statusMessage,
  paymentStatus,
  plans,
  signOutAction: signOut,
}: CheckoutClientProps) {
  const [selectedPlanKey, setSelectedPlanKey] = useState<PlanKey>(initialPlanKey);
  const plan = plans[selectedPlanKey];
  const t = useTranslations();
  const planKeys = Object.keys(plans) as PlanKey[];

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('checkout')}</h1>
          <p className="mt-2 text-sm text-zinc-600">{t('checkoutDescription')}</p>
        </div>
        <form
          action={signOut}
          className="shrink-0"
        >
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            {t('logout')}
          </button>
        </form>
      </div>

      {statusMessage && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-200">
          {statusMessage}
        </div>
      )}

      {/* Tier Selector */}
      <div className="mt-8">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          {t('checkoutSelectTier')}
        </p>
        <div className="grid grid-cols-1 gap-3 min-[608px]:grid-cols-3">
          {planKeys.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedPlanKey(key)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 transition-all duration-300 ease-in-out hover:scale-[1.01] ${
                selectedPlanKey === key
                  ? 'border-cyan-500 bg-zinc-900/80 ring-1 ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : 'border-zinc-700 bg-zinc-900/60 hover:border-cyan-500/40'
              }`}
            >
              <h3 className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-[0.2em]">
                {t(plans[key].labelKey)}
              </h3>
              <div className="text-2xl font-bold font-mono text-white">
                ${plans[key].amount}
              </div>
              <div className="text-xs text-zinc-200 leading-relaxed">
                {t(plans[key].detailKey)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            {t('homeCarousel.paywall.tierLabel')}
          </p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xl font-semibold text-white">{t(plan.labelKey)}</p>
              <p className="mt-2 text-sm text-zinc-400">{t(plan.detailKey)}</p>
            </div>
            <span className="rounded-full bg-zinc-900/90 px-4 py-2 text-sm font-semibold text-white">
              ${plan.amount}
            </span>
          </div>

          <div className="mt-6 rounded-2xl bg-zinc-900/80 p-5 text-sm text-zinc-300">
            <p className="font-semibold text-white">{t('paymentUnpaid')}</p>
            <p>{paymentStatus}</p>
          </div>

          <form action="/api/nowpayments/checkout" method="post" className="mt-6">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="plan" value={plan.key} />
            <button
              type="submit"
              className="w-full rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-400"
            >
              {t('homeCarousel.paywall.checkoutLabel')}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-sm text-zinc-300">
          <h2 className="mb-3 text-lg font-semibold text-white">
            {t('checkoutNeedHelp')}
          </h2>
          <p>{t('checkoutHelpText')}</p>
        </div>
      </div>

      <p className="mt-6 text-sm text-zinc-500">{t('homeCarousel.cryptomusPlaceholder')}</p>
    </main>
  );
}
