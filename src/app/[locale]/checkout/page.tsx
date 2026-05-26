import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@utils/supabase/server';
import { redirect } from '@/i18n/navigation';
import { signOutAction } from '../logout/actions';

export default async function CheckoutPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/login', locale: locale as 'ru' | 'en' });
    return;
  }

  const t = await getTranslations({ locale });

  // Prefer profiles.payment_status once the table exists; metadata mirrors sign-up for now.
  const paymentStatus =
    (user.user_metadata?.payment_status as string | undefined) ?? 'unpaid';

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('checkout')}</h1>
          <p className="mt-2 text-sm text-zinc-600">{t('checkoutDescription')}</p>
        </div>
        <form action={signOutAction}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            {t('logout')}
          </button>
        </form>
      </div>
      <p className="mt-4 inline-block rounded bg-amber-100 px-3 py-1 text-sm text-amber-900">
        {t('paymentUnpaid')}: {paymentStatus}
      </p>
      <p className="mt-6 text-sm text-zinc-500">{t('cryptomusPlaceholder')}</p>
    </main>
  );
}
