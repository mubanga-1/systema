import { createClient } from '@utils/supabase/server';
import { routing } from '@/i18n/routing';
import { PLANS, resolvePlan } from '@utils/supabase/billing';

function resolveLocale(value: FormDataEntryValue | null): 'ru' | 'en' {
  const locale = String(value ?? routing.defaultLocale);
  return routing.locales.includes(locale as 'ru' | 'en')
    ? (locale as 'ru' | 'en')
    : routing.defaultLocale;
}

function paymentReturnUrl(
  siteUrl: string,
  locale: string,
  envKey: string,
  fallback: string,
  plan: string
) {
  const rawPath = process.env[envKey] ?? fallback;
  const path = rawPath.replace(/^\//, '');
  const joiner = path.includes('?') ? '&' : '?';

  return `${siteUrl}/${locale}/${path}${joiner}plan=${plan}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const locale = resolveLocale(formData.get('locale'));
  const planKey = resolvePlan(formData.get('plan'));
  const plan = PLANS[planKey];

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    'http://localhost:3000';
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

  const orderId = `systema:${user.id}:${planKey}:${Date.now()}`;

  const response = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
    },
    body: JSON.stringify({
      price_amount: plan.amount,
      price_currency: 'usd',
      order_id: orderId,
      order_description: `Systema ${plan.label} subscription`,
      success_url: paymentReturnUrl(
        siteUrl,
        locale,
        'NOW_PAYMENTS_SUCCESS_URL',
        'payments/success',
        planKey
      ),
      cancel_url: paymentReturnUrl(
        siteUrl,
        locale,
        'NOW_PAYMENTS_CANCEL_URL',
        'payments/cancel',
        planKey
      ),
      fail_url: paymentReturnUrl(
        siteUrl,
        locale,
        'NOW_PAYMENTS_FAIL_URL',
        'payments/fail',
        planKey
      ),
      ipn_callback_url: `${siteUrl}/api/nowpayments/webhook`,
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
