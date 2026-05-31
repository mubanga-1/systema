import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function PaymentSuccessPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center px-4 py-12 text-zinc-100">
      <section className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Payment received
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Your subscription is being confirmed
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          NOWPayments has returned you to Systema. The webhook will update your
          subscription automatically; refresh billing if the status has not changed yet.
        </p>
        <div className="mt-6 flex flex-col gap-3 min-[608px]:flex-row">
          <Link
            href="/billing"
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
          >
            Open billing
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-zinc-600 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:border-zinc-300"
          >
            Open dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
