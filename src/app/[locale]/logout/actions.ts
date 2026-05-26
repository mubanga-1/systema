'use server';

import { createClient } from '@utils/supabase/server';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

function parseLocale(value: FormDataEntryValue | null): 'ru' | 'en' {
  const locale = String(value ?? routing.defaultLocale);
  return routing.locales.includes(locale as 'ru' | 'en')
    ? (locale as 'ru' | 'en')
    : routing.defaultLocale;
}

export async function signOutAction(formData: FormData) {
  const locale = parseLocale(formData.get('locale'));

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect({ href: '/login', locale });
}
