import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { createClient } from '@utils/supabase/server';
import { ResetPasswordForm } from '../reset-password/ResetPasswordForm';
import { cookies } from 'next/headers';

export default async function EnterNewPasswordPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cookieStore = await cookies();
  const hasRecoveryCookie =
    cookieStore.get('systema_password_recovery')?.value === '1';

  if (!hasRecoveryCookie) {
    redirect({ href: '/reset-password', locale: locale as 'ru' | 'en' });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/reset-password', locale: locale as 'ru' | 'en' });
  }

  const t = await getTranslations({ locale });
  const labels = {
    email: t('email'),
    password: t('newPassword'),
    confirmPassword: t('confirmPassword'),
    passwordMismatch: t('passwordMismatch'),
    resetPassword: t('resetPassword'),
    resetPasswordSent: t('resetPasswordSent'),
    resetPasswordError: t('resetPasswordError'),
  };

  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-cyan-200/25 bg-slate-950/55 p-7 shadow-[0_0_30px_rgba(45,212,191,0.12)] backdrop-blur-md">
        <h1 className="mb-3 text-2xl font-semibold text-white">
          {t('enterNewPassword')}
        </h1>
        <p className="mb-6 text-sm leading-6 text-zinc-300">
          {t('enterNewPasswordDescription')}
        </p>
        <ResetPasswordForm
          key={locale}
          locale={locale}
          labels={labels}
          mode="update"
        />
      </section>
    </main>
  );
}
