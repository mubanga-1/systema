'use client';

import { usePathname } from '@/i18n/navigation';

type AppBackgroundShellProps = {
  children: React.ReactNode;
};

export function AppBackgroundShell({ children }: AppBackgroundShellProps) {
  const pathname = usePathname();
  const hideBackground =
    pathname.startsWith('/dashboard') || pathname.startsWith('/settings');

  return (
    <div className="w-full">
      <div
        className={
          hideBackground
            ? 'h-[calc(100dvh-var(--navbar-height,56px))] overflow-auto bg-zinc-50 text-zinc-900'
            : 'app-themed-bg h-[calc(100dvh-var(--navbar-height,56px))] overflow-auto text-zinc-100'
        }
      >
        {children}
      </div>
    </div>
  );
}
