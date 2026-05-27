'use server';

import { createClient } from '@utils/supabase/server';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export type SignUpState = {
  errorCode?: 'passwordMismatch' | 'signUpError' | 'emailExists';
  message?: string;
};

function parseLocale(value: FormDataEntryValue | null): 'ru' | 'en' {
  const locale = String(value ?? routing.defaultLocale);
  return routing.locales.includes(locale as 'ru' | 'en')
    ? (locale as 'ru' | 'en')
    : routing.defaultLocale;
}

export async function signUpAction(
  _prev: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const locale = parseLocale(formData.get('locale'));
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password !== confirmPassword) {
    return { errorCode: 'passwordMismatch' };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/${locale}/auth/callback`,
      data: {
        locale,
        payment_status: 'unpaid',
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    const duplicate =
      msg.includes('already') ||
      msg.includes('duplicate') ||
      msg.includes('user already') ||
      msg.includes('email') && msg.includes('exists');

    if (duplicate) {
      return { errorCode: 'emailExists', message: 'Email already registered' };
    }

    return { errorCode: 'signUpError', message: error.message };
  }

  if (data.session) {
    redirect({ href: '/checkout', locale });
  }

  redirect({ href: '/register/confirm', locale });
  return {};
}
