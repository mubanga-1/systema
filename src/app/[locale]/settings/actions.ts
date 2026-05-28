'use server';

import { createClient } from '@utils/supabase/server';
import { routing } from '@/i18n/routing';

export type ChangePasswordState = {
  errorCode?: 'passwordMismatch' | 'invalidCurrentPassword' | 'changeError';
  message?: string;
  ok?: boolean;
};

export type AccountResetPasswordState = {
  error?: true;
  message?: string;
  ok?: boolean;
};

function parseLocale(value: FormDataEntryValue | null): 'ru' | 'en' {
  const locale = String(value ?? routing.defaultLocale);
  return routing.locales.includes(locale as 'ru' | 'en')
    ? (locale as 'ru' | 'en')
    : routing.defaultLocale;
}

function getCallbackUrl() {
  return (
    process.env.NEXT_PUBLIC_EMAIL_CALLBACK_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    'http://localhost:3000'
  );
}

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const currentPassword = String(formData.get('currentPassword') ?? '');
  const newPassword = String(formData.get('newPassword') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (newPassword !== confirmPassword) {
    return { errorCode: 'passwordMismatch' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { errorCode: 'changeError', message: 'Not signed in' };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return { errorCode: 'invalidCurrentPassword' };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { errorCode: 'changeError', message: error.message };
  }

  return { ok: true };
}

export async function sendAccountResetPasswordAction(
  _prev: AccountResetPasswordState,
  formData: FormData
): Promise<AccountResetPasswordState> {
  const locale = parseLocale(formData.get('locale'));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: true, message: 'Not signed in' };
  }

  const callbackUrl = getCallbackUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${callbackUrl}/${locale}/auth/callback?next=${encodeURIComponent('/enter-new-password')}`,
  });

  if (error) {
    return { error: true, message: error.message };
  }

  return { ok: true };
}
