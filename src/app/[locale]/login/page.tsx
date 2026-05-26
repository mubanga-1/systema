import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LoginForm } from './LoginForm';

export default async function LoginPage({
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
    signIn: t('signIn'),
    emailNotConfirmed: t('emailNotConfirmed'),
    signInError: t('signInError'),
  };

  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-cyan-200/25 bg-slate-950/55 p-7 shadow-[0_0_30px_rgba(45,212,191,0.12)] backdrop-blur-md">
        <h1 className="mb-6 text-2xl font-semibold text-white">{t('login')}</h1>
        <LoginForm key={locale} locale={locale} labels={labels} />
        <p className="mt-4 text-sm text-zinc-300">
          {t('noAccount')}{' '}
          <Link href="/register" className="font-medium text-cyan-200 hover:text-cyan-100">
            {t('register')}
          </Link>
        </p>
      </section>
    </main>
  );
}
