import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/Navbar';
import { AppBackgroundShell } from '@/components/AppBackgroundShell';
import { DashboardFooter } from '@/components/DashboardFooter';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'ru' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
          <Navbar locale={locale as 'ru' | 'en'} />
          <AppBackgroundShell>
            {children}
          </AppBackgroundShell>
          <DashboardFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
