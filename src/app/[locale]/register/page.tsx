import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { RegisterForm } from './RegisterForm';

export default async function RegisterPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ reason?: string }>;
}>) {
  const { locale } = await params;
  const { reason } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale });

  const labels = {
    email: t('email'),
    password: t('password'),
    confirmPassword: t('confirmPassword'),
    signUp: t('signUp'),
    passwordMismatch: t('passwordMismatch'),
    signUpError: t('signUpError'),
    emailExists: t('emailAlreadyRegistered'),
  };

  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-cyan-200/25 bg-slate-950/55 p-7 shadow-[0_0_30px_rgba(45,212,191,0.12)] backdrop-blur-md">
        <h1 className="mb-6 text-2xl font-semibold text-white">{t('register')}</h1>
        {reason === 'accountNotFound' && (
          <p className="mb-4 rounded-lg border border-amber-300/60 bg-amber-100/15 px-3 py-2 text-sm text-amber-100">
            {t('accountNotFound')}
          </p>
        )}
        <RegisterForm key={locale} locale={locale} labels={labels} />
        <p className="mt-4 text-sm text-zinc-300">
          {t('hasAccount')}{' '}
          <Link href="/login" className="font-medium text-cyan-200 hover:text-cyan-100">
            {t('login')}
          </Link>
        </p>
      </section>
    </main>
  );
}
