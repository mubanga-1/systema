'use server';

import { createClient } from '@utils/supabase/server';
import { routing } from '@/i18n/routing';

const PLANS = {
  base: { label: 'BASE', price: 29 },
  pro: { label: 'PRO', price: 79 },
  vanguard: { label: 'VANGUARD', price: 299 },
} as const;

type PlanKey = keyof typeof PLANS;

function resolveLocale(value: FormDataEntryValue | null): 'ru' | 'en' {
  const locale = String(value ?? routing.defaultLocale);
  return routing.locales.includes(locale as 'ru' | 'en')
    ? (locale as 'ru' | 'en')
    : routing.defaultLocale;
}

function resolvePlan(value: FormDataEntryValue | null): PlanKey {
  const plan = String(value ?? 'pro').toLowerCase();
  return plan in PLANS ? (plan as PlanKey) : 'pro';
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const locale = resolveLocale(formData.get('locale'));
  const planKey = resolvePlan(formData.get('plan'));
  const plan = PLANS[planKey];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const key = process.env.NOW_PAYMENTS_API_KEY;

  if (!key) {
    return new Response('NOW_PAYMENTS_API_KEY is not configured', { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.redirect(new URL(`/${locale}/login`, request.url));
  }

  const orderId = `${user.id}-${planKey}-${Date.now()}`;
  const successUrl = `${siteUrl}/${locale}/checkout?status=success&plan=${planKey}`;
  const cancelUrl = `${siteUrl}/${locale}/checkout?status=cancel&plan=${planKey}`;

  const response = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
    },
    body: JSON.stringify({
      price_amount: plan.price,
      price_currency: 'usd',
      order_id: orderId,
      order_description: `Systema ${plan.label} subscription`,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload.invoice_url) {
    return new Response(JSON.stringify(payload), {
      status: response.ok ? 502 : response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return Response.redirect(payload.invoice_url);
}
