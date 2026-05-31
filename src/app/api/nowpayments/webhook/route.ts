import { NextResponse } from 'next/server';
import { createAdminClient } from '@utils/supabase/admin';
import {
  markPaymentCanceled,
  markPaymentSucceeded,
  resolvePlan,
} from '@utils/supabase/billing';
import crypto from 'crypto';

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function parseOrderId(orderId: unknown) {
  if (typeof orderId !== 'string') {
    return { userId: null, planKey: null };
  }

  const structured = orderId.match(
    /^systema:([0-9a-f-]{36}):(base|pro|vanguard):\d+$/i
  );
  if (structured) {
    return { userId: structured[1], planKey: structured[2].toLowerCase() };
  }

  const parts = orderId.split('-');
  const legacyUserId = parts.slice(0, 5).join('-');
  const legacyPlan = parts[5]?.toLowerCase() ?? null;

  if (UUID_PATTERN.test(legacyUserId) && legacyPlan) {
    return { userId: legacyUserId, planKey: legacyPlan };
  }

  return { userId: null, planKey: null };
}

export async function POST(request: Request) {
  const body = await request.text();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  const webhookUrl = `${baseUrl}/api/nowpayments/webhook`;

  const secret = process.env.NOW_PAYMENTS_WEBHOOK_SECRET;
  const sigHeader = 
    request.headers.get('x-nowpayments-sig') || 
    request.headers.get('x-nowpayments-signature') || 
    request.headers.get('x-nowpayment-signature') || 
    request.headers.get('x-signature');

  if (!secret) {
    console.error(`[Webhook Error] NOW_PAYMENTS_WEBHOOK_SECRET is missing. Webhook URL: ${webhookUrl}`);
    return new Response('Webhook secret is not configured', { status: 500 });
  }

  if (!sigHeader) {
    return new Response('signature header missing', { status: 400 });
  }

  const normalizedSignature = sigHeader.trim();
  if (!/^[a-f0-9]+$/i.test(normalizedSignature)) {
    return new Response('invalid signature', { status: 401 });
  }

  const expected = crypto.createHmac('sha512', secret).update(body).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  const signatureBuffer = Buffer.from(normalizedSignature, 'hex');
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return new Response('invalid signature', { status: 401 });
  }

  const payload = safeJsonParse(body);
  if (!payload) return new Response('invalid json', { status: 400 });

  // Determine order id and user
  const orderId = payload.order_id || payload.orderId || payload.id || payload.invoice_id || payload.invoiceId;
  const { userId, planKey } = parseOrderId(orderId);

  // Identify paid-like statuses
  const statusFields = [payload.status, payload.invoice_status, payload.payment_status, payload.event];
  const statusStr = String(statusFields.find(Boolean) ?? '').toLowerCase();
  const paidIndicators = ['paid', 'confirmed', 'successful', 'payment_received', 'finished'];
  const isPaid = paidIndicators.some((p) => statusStr.includes(p));

  const admin = createAdminClient();

  try {
    // Idempotent invoice handling: update or insert invoice record
    const providerId = payload.id || payload.invoice_id || payload.invoiceId || null;
    const invoiceStatus = (payload.status || payload.invoice_status || payload.payment_status || '').toString();

    if (providerId) {
      // Try to find an existing invoice by provider id
      const { data: existingInvoice } = await admin
        .from('invoices')
        .select('*')
        .eq('provider_invoice_id', providerId)
        .maybeSingle();

      if (existingInvoice) {
        // If status changed, update it
        const current = (existingInvoice.status || '').toString().toLowerCase();
        const newStatus = invoiceStatus || (isPaid ? 'paid' : existingInvoice.status);
        if (newStatus && newStatus.toLowerCase() !== current) {
          await admin.from('invoices').update({ status: newStatus }).eq('id', existingInvoice.id);
        }
      } else {
        // Insert a new invoice record linked to the user if we can
        await admin.from('invoices').insert({
          user_id: userId,
          subscription_user_id: userId,
          provider_invoice_id: providerId,
          invoice_url: payload.invoice_url || payload.url || null,
          amount: payload.price_amount || payload.amount || null,
          currency: payload.price_currency || payload.currency || null,
          status: invoiceStatus || (isPaid ? 'paid' : 'pending'),
        });
      }
    }

    // Update subscription and profile if payment confirmed
    if (isPaid && userId) {
      await markPaymentSucceeded({
        userId,
        plan: resolvePlan(planKey),
        providerId,
      });

      console.log(`Payment success for user ${userId}. Internal Success URL: ${process.env.NOW_PAYMENTS_SUCCESS_URL}`);
    }

    // Handle cancellations or failures
    if (!isPaid && userId && statusStr.includes('cancel')) {
      await markPaymentCanceled(userId);
      console.log(`Payment cancelled for ${userId}. Ref: ${process.env.NOW_PAYMENTS_CANCEL_URL}`);
    } else if (!isPaid && userId && (statusStr.includes('fail') || statusStr.includes('reject'))) {
      console.log(`Payment failed for ${userId}. Ref: ${process.env.NOW_PAYMENTS_FAIL_URL}`);
    }
  } catch (e) {
    // Log and return 500
    console.error('nowpayments webhook handling error', e);
    return new Response('webhook handling error', { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
