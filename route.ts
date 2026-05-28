import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-nowpayments-sig');
    const secret = process.env.NOW_PAYMENTS_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return new Response('Missing signature or secret configuration', { status: 401 });
    }

    // We use req.text() to get the raw body string for accurate HMAC verification
    const body = await req.text();

    const hmac = crypto.createHmac('sha512', secret);
    hmac.update(body);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature !== signature) {
      return new Response('Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(body);
    const { payment_id, payment_status } = payload;

    // Utilize redirect URLs for internal logging or asynchronous user notifications
    const successUrl = process.env.NOW_PAYMENTS_SUCCESS_URL;
    const cancelUrl = process.env.NOW_PAYMENTS_CANCEL_URL;
    const failUrl = process.env.NOW_PAYMENTS_FAIL_URL;

    console.log(`NOWPayments Webhook: Payment ${payment_id} status is ${payment_status}`);

    // Map the status to corresponding environment variables
    if (payment_status === 'finished') {
      // Example: Send a success email that links to successUrl
      console.log(`Payment completed. Link: ${successUrl}`);
    } else if (payment_status === 'failed' || payment_status === 'rejected') {
      console.log(`Payment failed. Error info at: ${failUrl}`);
    } else if (payment_status === 'expired') {
      console.log(`Payment expired. Cancellation link: ${cancelUrl}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}