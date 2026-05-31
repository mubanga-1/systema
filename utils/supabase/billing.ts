import { createAdminClient } from './admin';

export const PLANS = {
  base: {
    key: 'base',
    label: 'BASE',
    amount: 29,
    access: 'Scheduler',
  },
  pro: {
    key: 'pro',
    label: 'PRO',
    amount: 79,
    access: 'API access',
  },
  vanguard: {
    key: 'vanguard',
    label: 'VANGUARD',
    amount: 299,
    access: 'Full done-for-you AI pipeline',
  },
} as const;

export type PlanKey = keyof typeof PLANS;

const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];

export type BillingSnapshot = {
  paymentStatus: string;
  plan: PlanKey;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  nextBillingAt: string | null;
  lastPaidAt: string | null;
  subscriptionCount: number;
};

type SupabaseMaybeError = {
  code?: string;
  message?: string;
};

type ProfileBillingRow = {
  payment_status?: string | null;
  plan?: string | null;
  next_billing_at?: string | null;
  subscription_count?: number | null;
  last_paid_at?: string | null;
};

function isMissingSchemaError(error: unknown) {
  const maybeError = error as SupabaseMaybeError;
  const message = maybeError?.message?.toLowerCase() ?? '';

  return (
    maybeError?.code === 'PGRST205' ||
    maybeError?.code === 'PGRST204' ||
    maybeError?.code === '42P01' ||
    maybeError?.code === '42703' ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    message.includes('could not find') && message.includes('column')
  );
}

export function resolvePlan(value: unknown): PlanKey {
  const plan = String(value ?? 'pro').toLowerCase();
  return PLAN_KEYS.includes(plan as PlanKey) ? (plan as PlanKey) : 'pro';
}

export function isSubscriptionExpired(currentPeriodEnd: string | null | undefined) {
  if (!currentPeriodEnd) return false;
  return new Date(currentPeriodEnd).getTime() <= Date.now();
}

export async function expireSubscriptionIfDue(userId: string) {
  const admin = createAdminClient();
  const [{ data: subscription, error }, { data: profile, error: profileError }] =
    await Promise.all([
      admin
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', userId)
        .maybeSingle(),
      admin
        .from('profiles')
        .select('payment_status, next_billing_at')
        .eq('id', userId)
        .maybeSingle(),
    ]);

  if (error) {
    if (isMissingSchemaError(error)) return false;
    throw error;
  }

  if (profileError && !isMissingSchemaError(profileError)) {
    throw profileError;
  }

  const subscriptionStatus = String(subscription?.status ?? '').toLowerCase();
  const paymentStatus = String(profile?.payment_status ?? '').toLowerCase();
  const isActive = subscriptionStatus === 'active' || paymentStatus === 'paid';
  const nextBillingAt = profile?.next_billing_at ?? subscription?.current_period_end;

  if (!isActive || !isSubscriptionExpired(nextBillingAt)) {
    return false;
  }

  await Promise.all([
    admin
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('user_id', userId),
    admin
      .from('profiles')
      .update({ payment_status: 'unpaid' })
      .eq('id', userId),
  ]);

  return true;
}

export async function getBillingSnapshot(userId: string): Promise<BillingSnapshot> {
  await expireSubscriptionIfDue(userId);

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('payment_status, plan, next_billing_at, subscription_count, last_paid_at')
    .eq('id', userId)
    .maybeSingle();

  const fallbackProfile =
    profileError && isMissingSchemaError(profileError)
      ? await admin
          .from('profiles')
          .select('payment_status, plan')
          .eq('id', userId)
          .maybeSingle()
      : { data: profile, error: profileError };

  if (fallbackProfile.error && !isMissingSchemaError(fallbackProfile.error)) {
    throw fallbackProfile.error;
  }

  const { data: subscription, error: subscriptionError } = await admin
    .from('subscriptions')
    .select('plan, status, current_period_end, start_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (subscriptionError && !isMissingSchemaError(subscriptionError)) {
    throw subscriptionError;
  }

  const profileRow = fallbackProfile.data as ProfileBillingRow | null;
  const subscriptionRow = subscriptionError ? null : subscription;

  return {
    paymentStatus: String(profileRow?.payment_status ?? 'unpaid'),
    plan: resolvePlan(subscriptionRow?.plan ?? profileRow?.plan),
    subscriptionStatus: String(
      subscriptionRow?.status ?? profileRow?.payment_status ?? 'unpaid'
    ),
    currentPeriodEnd: subscriptionRow?.current_period_end ?? null,
    nextBillingAt:
      profileRow?.next_billing_at ?? subscriptionRow?.current_period_end ?? null,
    lastPaidAt: profileRow?.last_paid_at ?? subscriptionRow?.start_at ?? null,
    subscriptionCount: Number(profileRow?.subscription_count ?? 0),
  };
}

export async function markPaymentSucceeded(params: {
  userId: string;
  plan: PlanKey;
  providerId?: string | null;
}) {
  const admin = createAdminClient();
  const now = new Date();
  const nextPeriod = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await admin
    .from('subscriptions')
    .upsert({
      user_id: params.userId,
      plan: params.plan,
      status: 'active',
      provider_subscription_id: params.providerId ?? null,
      start_at: now.toISOString(),
      current_period_end: nextPeriod.toISOString(),
    })
    .select();

  const { data: profile } = await admin
    .from('profiles')
    .select('subscription_count')
    .eq('id', params.userId)
    .maybeSingle();

  await admin
    .from('profiles')
    .update({
      payment_status: 'paid',
      plan: params.plan,
      next_billing_at: nextPeriod.toISOString(),
      last_paid_at: now.toISOString(),
      subscription_count: Number(profile?.subscription_count ?? 0) + 1,
    })
    .eq('id', params.userId);

  return { currentPeriodEnd: nextPeriod.toISOString() };
}

export async function markPaymentCanceled(userId: string) {
  const admin = createAdminClient();

  await Promise.all([
    admin
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', userId),
    admin
      .from('profiles')
      .update({ payment_status: 'unpaid' })
      .eq('id', userId),
  ]);
}
