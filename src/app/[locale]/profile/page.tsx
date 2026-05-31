import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@utils/supabase/server';
import { getBillingSnapshot } from '@utils/supabase/billing';
import { ChangePasswordForm } from '../settings/ChangePasswordForm';
import { AccountResetPasswordForm } from '../settings/AccountResetPasswordForm';
import { DeleteAccountForm } from './DeleteAccountForm';

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return '-';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'paid' || normalized === 'active') {
    return 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100';
  }

  if (normalized === 'past_due' || normalized === 'unpaid') {
    return 'border-amber-300/40 bg-amber-300/10 text-amber-100';
  }

  return 'border-zinc-500/40 bg-zinc-500/10 text-zinc-100';
}

export default async function ProfilePage({
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

  const billing = await getBillingSnapshot(user.id);
  const t = await getTranslations({ locale, namespace: 'settingsPage' });
  const commonT = await getTranslations({ locale });
  const sectionClass = 'rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6';
  const labelClass = 'text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300';

  return (
    <main className="min-h-full bg-zinc-950 px-4 py-8 pb-28 text-zinc-100">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-col gap-4 min-[608px]:flex-row min-[608px]:items-start min-[608px]:justify-between">
          <div>
            <p className={labelClass}>{t('account.title')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {t('account.title')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              {user.email}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-300"
          >
            {t('subscription.dashboard')}
          </Link>
        </div>

        <section className={`mt-8 ${sectionClass}`}>
          <p className={labelClass}>{t('account.title')}</p>
          <div className="mt-5 grid gap-4 min-[608px]:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">{t('account.email')}</p>
              <p className="mt-1 break-all text-base font-medium text-white">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">{t('account.joined')}</p>
              <p className="mt-1 text-base font-medium text-white">
                {formatDate(user.created_at, locale)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">{t('account.profileStatus')}</p>
              <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(billing.paymentStatus)}`}>
                {billing.paymentStatus}
              </span>
            </div>
          </div>
        </section>

        <section className={`mt-5 ${sectionClass}`}>
          <p className={labelClass}>{t('security.title')}</p>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {t('security.description')}
          </p>
          <ChangePasswordForm
            labels={{
              currentPassword: t('security.currentPassword'),
              newPassword: commonT('newPassword'),
              confirmPassword: commonT('confirmPassword'),
              submit: t('security.changePassword'),
              success: t('security.changeSuccess'),
              passwordMismatch: commonT('passwordMismatch'),
              invalidCurrentPassword: t('security.invalidCurrentPassword'),
              changeError: t('security.changeError'),
            }}
          />
          <div className="mt-5">
            <AccountResetPasswordForm
              locale={locale}
              labels={{
                submit: t('security.forgotPassword'),
                success: t('security.resetEmailSent'),
                error: t('security.resetEmailError'),
              }}
            />
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-950/30 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
            {t('danger.title')}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {t('danger.description')}
          </p>
          <DeleteAccountForm
            locale={locale}
            email={user.email ?? ''}
            label={t('danger.delete')}
          />
        </section>
      </div>
    </main>
  );
}
