import { createClient } from '@utils/supabase/server';

export async function insertInvoice(record: {
  user_id: string;
  subscription_user_id?: string | null;
  provider_invoice_id?: string | null;
  invoice_url?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('invoices').insert(record).select().single();
  if (error) throw error;
  return data;
}
