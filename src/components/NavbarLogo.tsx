'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ROUTES } from './routes';

export function NavbarLogo({ user, children }: { user: unknown; children: React.ReactNode }) {
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (user) {
      e.preventDefault(); // Stop navigation to landing page
      router.refresh();   // Perform a soft refresh/revalidation of the dashboard
    }
  };

  return (
    <Link href={ROUTES.HOME} onClick={handleLogoClick} className="flex items-center gap-0 text-white transition-opacity hover:opacity-90" aria-label="Systema home">
      {children}
    </Link>
  );
}