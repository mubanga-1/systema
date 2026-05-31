'use server';

import { createClient } from '@utils/supabase/server';
import { createAdminClient } from '@utils/supabase/admin';
import { routing } from '@/i18n/routing';
import { redirect } from '@/i18n/navigation';

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

export type DeleteAccountState = {
  error?: true;
  message?: string;
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

export async function deleteAccountAction(
  _prev: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const locale = parseLocale(formData.get('locale'));
  const confirmation = String(formData.get('confirmation') ?? '').trim();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: true, message: 'Not signed in' };
  }

  if (confirmation.toLowerCase() !== user.email.toLowerCase()) {
    return { error: true, message: 'Enter your email address to confirm deletion' };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return { error: true, message: error.message };
  }

  await supabase.auth.signOut();
  redirect({ href: '/', locale });
  return {};
}
