import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ResetPasswordForm } from './ResetPasswordForm';

export default async function ResetPasswordPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale });
  const labels = {
    email: t('email'),
    password: t('password'),
    confirmPassword: t('confirmPassword'),
    passwordMismatch: t('passwordMismatch'),
    resetPassword: t('resetPassword'),
    resetPasswordSent: t('resetPasswordSent'),
    resetPasswordError: t('resetPasswordError'),
  };

  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-cyan-200/25 bg-slate-950/55 p-7 shadow-[0_0_30px_rgba(45,212,191,0.12)] backdrop-blur-md">
        <h1 className="mb-6 text-2xl font-semibold text-white">{t('resetPassword')}</h1>
        <ResetPasswordForm
          key={locale}
          locale={locale}
          labels={labels}
          mode="request"
        />
      </section>
    </main>
  );
}
