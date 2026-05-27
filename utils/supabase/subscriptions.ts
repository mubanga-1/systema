import { createClient } from '@utils/supabase/server';

export type Subscription = {
  user_id: string;
  plan: string;
  status: string;
  provider_subscription_id?: string | null;
  start_at?: string | null;
  current_period_end?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function getSubscriptionByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as Subscription | null;
}

export async function upsertSubscription(userId: string, payload: Partial<Subscription>) {
  const supabase = await createClient();
  const row = { user_id: userId, ...payload };
  const { data, error } = await supabase.from('subscriptions').upsert(row).select().single();
  if (error) throw error;
  return data as Subscription;
}

export async function setSubscriptionStatus(userId: string, status: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status })
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as Subscription;
}
