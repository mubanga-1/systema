'use server';

import { createClient } from '@utils/supabase/server';
import { createAdminClient } from '@utils/supabase/admin';
import { resolvePlan, type PlanKey } from '@utils/supabase/billing';

export async function updateSubscriptionStatus(status: 'active' | 'canceled') {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not signed in' };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('subscriptions')
    .update({ status })
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  if (status === 'canceled') {
    await admin
      .from('profiles')
      .update({ payment_status: 'unpaid' })
      .eq('id', user.id);
  }

  return { success: true };
}

export async function updateSubscriptionPlan(plan: PlanKey) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not signed in' };
  }

  const admin = createAdminClient();
  const nextPlan = resolvePlan(plan);
  const { error } = await admin
    .from('subscriptions')
    .update({ plan: nextPlan })
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  await admin.from('profiles').update({ plan: nextPlan }).eq('id', user.id);

  return { success: true };
}
