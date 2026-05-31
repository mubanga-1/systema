import { createAdminClient } from '@utils/supabase/admin';
import { insertInvoice } from '@utils/supabase/invoices';
import { routing } from '@/i18n/routing';
import { hasValidCronSecret } from '../../../routeGuards';
import { PLANS, resolvePlan } from '@utils/supabase/billing';

type InvoiceGenerationResult = {
  user: string;
  invoice?: string | null;
  skipped?: boolean;
  error?: unknown;
};

export async function POST(request: Request) {
  if (!hasValidCronSecret(request)) {
    return new Response('unauthorized', { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  // Look for subscriptions expiring in the next 3 days
  const lookahead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data: subs, error } = await admin
    .from('subscriptions')
    .select('*')
    .or(`current_period_end.is.null,current_period_end.lte.${lookahead}`)
    .eq('status', 'active');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const key = process.env.NOW_PAYMENTS_API_KEY;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    'http://localhost:3000';
  if (!key) return new Response('NOW_PAYMENTS_API_KEY missing', { status: 500 });

  const created: InvoiceGenerationResult[] = [];

  for (const s of subs ?? []) {
    try {
      // Skip if there's already a pending invoice for this subscription/user
      const { data: existing } = await admin
        .from('invoices')
        .select('*')
        .eq('subscription_user_id', s.user_id)
        .in('status', ['pending', 'created', 'processing'])
        .limit(1)
        .maybeSingle();

      if (existing) {
        created.push({ user: s.user_id, invoice: existing.invoice_url, skipped: true });
        continue;
      }
      const planKey = resolvePlan(s.plan);
      const plan = PLANS[planKey];
      const orderId = `systema:${s.user_id}:${planKey}:${Date.now()}`;

      const successPath = process.env.NOW_PAYMENTS_SUCCESS_URL || `payments/success?plan=${s.plan}`;
      const cancelPath = process.env.NOW_PAYMENTS_CANCEL_URL || `payments/cancel?plan=${s.plan}`;
      const failPath = process.env.NOW_PAYMENTS_FAIL_URL || `payments/fail?plan=${s.plan}`;

      const successUrl = `${siteUrl}/${routing.defaultLocale}/${successPath.replace(/^\//, '')}`;
      const cancelUrl = `${siteUrl}/${routing.defaultLocale}/${cancelPath.replace(/^\//, '')}`;
      const failUrl = `${siteUrl}/${routing.defaultLocale}/${failPath.replace(/^\//, '')}`;

      const resp = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key },
        body: JSON.stringify({
          price_amount: plan.amount,
          price_currency: 'usd',
          order_id: orderId,
          order_description: `Systema ${plan.label} subscription`,
          success_url: successUrl,
          cancel_url: cancelUrl,
          fail_url: failUrl,
          ipn_callback_url: `${siteUrl}/api/nowpayments/webhook`,
        }),
      });

      const payload = await resp.json();
      if (resp.ok && payload && payload.invoice_url) {
        await insertInvoice({
          user_id: s.user_id,
          subscription_user_id: s.user_id,
          provider_invoice_id: payload.id || payload.invoice_id || null,
          invoice_url: payload.invoice_url,
          amount: plan.amount,
          currency: 'usd',
          status: 'pending',
        });

        created.push({ user: s.user_id, invoice: payload.invoice_url });
      } else {
        created.push({ user: s.user_id, error: payload });
      }
    } catch (e) {
      created.push({ user: s.user_id, error: String(e) });
    }
  }

  return new Response(JSON.stringify({ created }), { headers: { 'Content-Type': 'application/json' } });
}
