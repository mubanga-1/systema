'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface DashboardProfileCardProps {
  email: string;
  tier: string;
  renewalDate: string | null;
  paymentStatus: string;
}

export function DashboardProfileCard({
  email,
  tier,
  renewalDate,
  paymentStatus,
}: DashboardProfileCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/settings');
  };

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('')
      .slice(0, 2)
      .map((c) => c.toUpperCase())
      .join('');
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-cyan-500/20 border-cyan-400',
      'bg-blue-500/20 border-blue-400',
      'bg-purple-500/20 border-purple-400',
      'bg-pink-500/20 border-pink-400',
      'bg-green-500/20 border-green-400',
    ];
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const isPaid = paymentStatus.toLowerCase() === 'paid';

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-2xl border border-cyan-200/25 bg-gradient-to-br from-cyan-900/20 to-slate-900/20 p-6 shadow-lg transition-all duration-300 hover:border-cyan-200/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${getAvatarColor(
            email
          )} font-semibold text-white`}
        >
          {getInitials(email)}
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-left">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-[0.1em]">
                Account
              </h3>
              <p className="mt-1 text-lg font-semibold text-white">{email}</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Subscription Info */}
          <div className="mt-3 flex flex-wrap gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                isPaid
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : 'bg-amber-500/20 text-amber-200'
              }`}
            >
              {tier}
            </span>
            {renewalDate && (
              <span className="inline-flex items-center rounded-full bg-zinc-800/50 px-3 py-1 text-xs text-zinc-300">
                Renews: {renewalDate}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-zinc-500">Click to manage account settings</p>
    </button>
  );
}
