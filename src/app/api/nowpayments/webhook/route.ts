'use server';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@utils/supabase/admin';
import crypto from 'crypto';

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.text();

  const secret = process.env.NOW_PAYMENTS_WEBHOOK_SECRET;
  const sigHeader = request.headers.get('x-nowpayments-signature') || request.headers.get('x-nowpayment-signature') || request.headers.get('x-signature');

  if (secret) {
    if (!sigHeader) {
      return new Response('signature header missing', { status: 400 });
    }

    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (sigHeader !== expected) {
      return new Response('invalid signature', { status: 401 });
    }
  }

  const payload = safeJsonParse(body);
  if (!payload) return new Response('invalid json', { status: 400 });

  // Determine order id and user
  const orderId = payload.order_id || payload.orderId || payload.id || payload.invoice_id || payload.invoiceId;
  let userId: string | null = null;
  let planKey: string | null = null;
  if (typeof orderId === 'string' && orderId.includes('-')) {
    const parts = orderId.split('-');
    userId = parts[0];
    planKey = parts[1] || null;
  }

  // Identify paid-like statuses
  const statusFields = [payload.status, payload.invoice_status, payload.payment_status, payload.event];
  const statusStr = String(statusFields.find(Boolean) ?? '').toLowerCase();
  const paidIndicators = ['paid', 'confirmed', 'successful', 'payment_received'];
  const isPaid = paidIndicators.some((p) => statusStr.includes(p));

  const admin = createAdminClient();

  try {
    if (isPaid && userId) {
      // Upsert subscription
      const now = new Date();
      const nextPeriod = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await admin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: planKey ?? 'pro',
          status: 'active',
          provider_subscription_id: payload.id || payload.invoice_id || null,
          start_at: now.toISOString(),
          current_period_end: nextPeriod.toISOString(),
        })
        .select();

      // Update profile payment_status to 'paid'
      await admin.from('profiles').update({ payment_status: 'paid' }).eq('id', userId);
    }

    // Optionally handle cancellations or failed events
    if (!isPaid && userId && statusStr.includes('cancel')) {
      await admin.from('subscriptions').update({ status: 'canceled' }).eq('user_id', userId);
      await admin.from('profiles').update({ payment_status: 'unpaid' }).eq('id', userId);
    }
  } catch (e) {
    // Log and return 500
    console.error('nowpayments webhook handling error', e);
    return new Response('webhook handling error', { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
