'use server';

import { createClient } from '@utils/supabase/server';
import { routing } from '@/i18n/routing';
import { redirect } from '@/i18n/navigation';
import { cookies } from 'next/headers';

function parseLocale(value: FormDataEntryValue | null): 'ru' | 'en' {
  const locale = String(value ?? routing.defaultLocale);
  return routing.locales.includes(locale as 'ru' | 'en')
    ? (locale as 'ru' | 'en')
    : routing.defaultLocale;
}

export type ResetPasswordState = {
  error?: true;
  errorCode?: 'passwordMismatch' | 'resetError';
  message?: string;
  ok?: boolean;
};

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const locale = parseLocale(formData.get('locale'));
  const email = String(formData.get('email') ?? '').trim();

  const supabase = await createClient();
  const callbackUrl =
    process.env.NEXT_PUBLIC_EMAIL_CALLBACK_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${callbackUrl}/${locale}/auth/callback?next=${encodeURIComponent('/enter-new-password')}`,
  });

  if (error) {
    return { error: true, errorCode: 'resetError', message: error.message };
  }

  return { ok: true };
}

export async function updatePasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const locale = parseLocale(formData.get('locale'));
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const cookieStore = await cookies();
  const hasRecoveryCookie =
    cookieStore.get('systema_password_recovery')?.value === '1';

  if (!hasRecoveryCookie) {
    return { error: true, errorCode: 'resetError', message: 'Reset link expired' };
  }

  if (password !== confirmPassword) {
    return { error: true, errorCode: 'passwordMismatch' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: true, errorCode: 'resetError', message: error.message };
  }

  await supabase.auth.signOut();
  cookieStore.delete('systema_password_recovery');
  redirect({ href: '/login', locale });
  return {};
}
