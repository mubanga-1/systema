import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error('NEXT_SUPABASE_SERVICE_ROLE_KEY is not set in environment');
  }

  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  });
}
