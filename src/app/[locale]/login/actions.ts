'use server';

import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@utils/supabase/server';

export type SignInState = {
  errorCode?: 'emailNotConfirmed' | 'signInError';
  message?: string;
};

function parseLocale(value: FormDataEntryValue | null): 'ru' | 'en' {
  const locale = String(value ?? routing.defaultLocale);
  return routing.locales.includes(locale as 'ru' | 'en')
    ? (locale as 'ru' | 'en')
    : routing.defaultLocale;
}

function isInvalidCredentials(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid credentials')
  );
}

function isEmailNotConfirmed(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('email not confirmed') ||
    normalized.includes('email_not_confirmed') ||
    normalized.includes('email not verified')
  );
}

export async function signInAction(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const locale = parseLocale(formData.get('locale'));
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (isInvalidCredentials(error.message)) {
      // Return a clear sign-in error so the UI can show "invalid credentials"
      return { errorCode: 'signInError', message: 'Invalid email or password' };
    }

    if (isEmailNotConfirmed(error.message)) {
      return { errorCode: 'emailNotConfirmed' };
    }

    return { errorCode: 'signInError', message: error.message };
  }

  if (!data.session) {
    return { errorCode: 'emailNotConfirmed' };
  }

  redirect({ href: '/dashboard', locale });
  return {};
}
