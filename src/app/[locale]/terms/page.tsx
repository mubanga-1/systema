import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function TermsPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'termsPage' });

  const sections = [
    'access',
    'payments',
    'acceptableUse',
    'availability',
    'liability',
  ] as const;

  return (
    <main className="min-h-full bg-zinc-950 px-4 py-10 pb-28 text-zinc-100 min-[821px]:pb-32">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white min-[608px]:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-300">
          {t('intro')}
        </p>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <article
              key={section}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6"
            >
              <h2 className="text-lg font-semibold text-white">
                {t(`${section}.title`)}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                {t(`${section}.body`)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
