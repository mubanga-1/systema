'use server';

import { createAdminClient } from '@utils/supabase/admin';
import { hasValidCronSecret } from '../../routeGuards';

type ExpiryCheckResult = {
  user: string;
  updated?: boolean;
  error?: string;
};

export async function POST(request: Request) {
  if (!hasValidCronSecret(request)) {
    return new Response('unauthorized', { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Find subscriptions where current_period_end < now and status = active
  const { data: due, error } = await admin
    .from('subscriptions')
    .select('*')
    .lt('current_period_end', now)
    .eq('status', 'active');

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const results: ExpiryCheckResult[] = [];

  for (const s of due ?? []) {
    try {
      await admin.from('subscriptions').update({ status: 'past_due' }).eq('user_id', s.user_id);
      await admin.from('profiles').update({ payment_status: 'unpaid' }).eq('id', s.user_id);
      results.push({ user: s.user_id, updated: true });
    } catch (e) {
      results.push({ user: s.user_id, error: String(e) });
    }
  }

  return new Response(JSON.stringify({ results }), { headers: { 'Content-Type': 'application/json' } });
}
