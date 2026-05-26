'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function DashboardFooter() {
  const t = useTranslations('footer');

  return (
    <footer className="min-[821px]:fixed relative mt-auto bottom-0 left-0 w-full z-50 px-6 min-[821px]:px-8 py-8 min-[821px]:py-4 flex flex-col min-[608px]:flex-row items-center justify-between gap-4 min-[608px]:gap-0 font-mono text-[10px] text-neutral-600 pointer-events-none bg-black/10 backdrop-blur-sm min-[821px]:bg-transparent">
      <div className="pointer-events-auto cursor-default">
        {t('copyright')}
      </div>
      <div className="flex gap-8 pointer-events-auto">
        <Link
          href="/support"
          className="transition-colors hover:text-neutral-400"
        >
          {t('links.support')}
        </Link>
        <Link
          href="/terms"
          className="transition-colors hover:text-neutral-400"
        >
          {t('links.terms')}
        </Link>
      </div>
    </footer>
  );
}
