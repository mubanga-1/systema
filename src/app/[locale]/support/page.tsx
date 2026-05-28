import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function SupportPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'supportPage' });

  const cards = ['billing', 'access', 'technical'] as const;

  return (
    <main className="min-h-full bg-zinc-950 px-4 py-10 pb-28 text-zinc-100 min-[821px]:pb-32">
      <section className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white min-[608px]:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300">
          {t('intro')}
        </p>

        <div className="mt-8 grid gap-4 min-[821px]:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6"
            >
              <h2 className="text-lg font-semibold text-white">
                {t(`${card}.title`)}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                {t(`${card}.body`)}
              </p>
            </article>
          ))}
        </div>

        <section className="mt-5 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-6">
          <h2 className="text-lg font-semibold text-white">{t('contact.title')}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-200">{t('contact.body')}</p>
          <Link
            href="/settings"
            className="mt-5 inline-flex rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400"
          >
            {t('contact.action')}
          </Link>
        </section>
      </section>
    </main>
  );
}
