'use server';

import { createClient } from '@utils/supabase/server';
import { createAdminClient } from '@utils/supabase/admin';
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

async function emailAlreadyRegistered(email: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function signUpAction(
  _prev: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const locale = parseLocale(formData.get('locale'));
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password !== confirmPassword) {
    return { errorCode: 'passwordMismatch' };
  }

  try {
    if (await emailAlreadyRegistered(email)) {
      return { errorCode: 'emailExists', message: 'Email already registered' };
    }
  } catch (error) {
    return {
      errorCode: 'signUpError',
      message: error instanceof Error ? error.message : 'Unable to verify email',
    };
  }

  const supabase = await createClient();
  const callbackUrl = process.env.NEXT_PUBLIC_EMAIL_CALLBACK_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${callbackUrl}/${locale}/auth/callback`,
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

  if (data.user?.identities?.length === 0) {
    return { errorCode: 'emailExists', message: 'Email already registered' };
  }

  if (data.session) {
    redirect({ href: '/checkout', locale });
  }

  redirect({ href: '/register/confirm', locale });
  return {};
}
