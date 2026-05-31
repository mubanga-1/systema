import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function PaymentCancelPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center px-4 py-12 text-zinc-100">
      <section className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
          Payment canceled
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          No subscription changes were made
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          You can return to billing and choose the same plan or a different access level.
        </p>
        <div className="mt-6">
          <Link
            href="/billing"
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
          >
            Return to billing
          </Link>
        </div>
      </section>
    </main>
  );
}
