'use server';

import { createClient } from '@utils/supabase/server';
import { routing } from '@/i18n/routing';

function parseLocale(value: FormDataEntryValue | null): 'ru' | 'en' {
  const locale = String(value ?? routing.defaultLocale);
  return routing.locales.includes(locale as 'ru' | 'en')
    ? (locale as 'ru' | 'en')
    : routing.defaultLocale;
}

export async function resetPasswordAction(_prev: any, formData: FormData) {
  const locale = parseLocale(formData.get('locale'));
  const email = String(formData.get('email') ?? '').trim();

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/${locale}/auth/callback`,
  } as any);

  if (error) {
    return { error: true, message: error.message };
  }

  return { ok: true };
}
