'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { ROUTES } from './routes';

type GuestNavTabsProps = {
  homeLabel: string;
  loginLabel: string;
  signupLabel: string;
};

function getTabClassName(isActive: boolean) {
  const baseClass =
    'rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200';
  const idleClass =
    'border-transparent text-zinc-200 hover:border-zinc-300/70 hover:bg-zinc-200/10 hover:text-white';
  const activeClass =
    'border-zinc-300/80 bg-zinc-200/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_0_22px_rgba(255,255,255,0.12)]';

  return `${baseClass} ${isActive ? activeClass : idleClass}`;
}

export function GuestNavTabs({
  homeLabel,
  loginLabel,
  signupLabel,
}: GuestNavTabsProps) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      <Link href="/" className={getTabClassName(pathname === '/')}>
        {homeLabel}
      </Link>
      <Link href="/login" className={getTabClassName(pathname === '/login')}>
        {loginLabel}
      </Link>
      <Link
        href="/register"
        className={getTabClassName(pathname === '/register')}
      >
        {signupLabel}
      </Link>
    </div>
  );
}
