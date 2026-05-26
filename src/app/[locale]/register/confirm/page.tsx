import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function RegisterConfirmPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale });

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center p-8">
      <h1 className="mb-4 text-2xl font-semibold">{t('confirmEmailTitle')}</h1>
      <p className="mb-6 text-sm text-zinc-600">{t('confirmEmailBody')}</p>
      <Link href="/login" className="text-sm font-medium text-zinc-900 underline">
        {t('login')}
      </Link>
    </main>
  );
}
