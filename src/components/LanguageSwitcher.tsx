'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const localeLinkClass =
  'rounded-full border px-3 py-1 text-sm font-medium transition-all duration-200 border-transparent text-zinc-200 hover:border-zinc-300/70 hover:bg-zinc-200/10 hover:text-white aria-[current=page]:border-zinc-300/80 aria-[current=page]:bg-zinc-200/15 aria-[current=page]:text-white aria-[current=page]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_0_22px_rgba(255,255,255,0.12)]';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      <Link
        href={pathname}
        locale="ru"
        aria-current={locale === 'ru' ? 'page' : undefined}
        className={localeLinkClass}
      >
        RU
      </Link>
      <Link
        href={pathname}
        locale="en"
        aria-current={locale === 'en' ? 'page' : undefined}
        className={localeLinkClass}
      >
        EN
      </Link>
    </div>
  );
}
