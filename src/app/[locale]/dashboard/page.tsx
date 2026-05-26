import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@utils/supabase/server';
import { notFound } from 'next/navigation';
import { signOutAction } from '../logout/actions';

export default async function DashboardPage({
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
    notFound();
  }

  const t = await getTranslations({ locale });

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('dashboard')}</h1>
          <p className="mt-2 text-sm text-zinc-600">{user.email}</p>
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
    </main>
  );
}
