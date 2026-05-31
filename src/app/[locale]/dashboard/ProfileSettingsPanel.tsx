'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { signOutAction } from '../logout/actions';

type ProfileSettingsPanelProps = {
  email: string;
  locale: string;
  labels: {
    profile: string;
    logout: string;
  };
};

export function ProfileSettingsPanel({
  email,
  locale,
  labels,
}: ProfileSettingsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-200/60 bg-cyan-400/15 text-sm font-semibold uppercase text-white shadow-[0_0_18px_rgba(34,211,238,0.14)] transition hover:bg-cyan-400/25"
        aria-expanded={open}
        aria-label={labels.profile}
      >
        {email.slice(0, 2)}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
          <Link
            href="/profile"
            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-900"
          >
            <span>{labels.profile}</span>
            <span aria-hidden>&gt;</span>
          </Link>

          <form action={signOutAction}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-zinc-100 transition hover:bg-zinc-900"
            >
              <span>{labels.logout}</span>
              <span aria-hidden>&gt;</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
