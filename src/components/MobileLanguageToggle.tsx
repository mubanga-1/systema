'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import React from 'react';

export function MobileLanguageToggle({ locale }: { locale: 'en' | 'ru' }) {
  const pathname = usePathname();
  const router = useRouter();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ru' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-6 right-6 z-[70] min-[608px]:hidden flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/80 text-white shadow-lg backdrop-blur-sm transition-all active:scale-95 font-bold text-xs uppercase border border-white/20"
      aria-label="Switch language"
    >
      {locale === 'en' ? 'RU' : 'EN'}
    </button>
  );
}