'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { ROUTES } from './routes';

export function MobileMenu({ 
  user, 
  homeLabel, 
  loginLabel, 
  signupLabel, 
  dashboardLabel, 
  settingsLabel 
}: { 
  user: unknown; 
  homeLabel: string; 
  loginLabel: string; 
  signupLabel: string; 
  dashboardLabel: string; 
  settingsLabel: string; 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
    <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-center p-2 text-white hover:text-cyan-300 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-[56px] left-0 w-full bg-[#061329] border-b border-cyan-200/20 p-6 flex flex-col gap-5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          {user ? (
            <>
              <Link href={ROUTES.DASHBOARD} onClick={() => setIsOpen(false)} className="text-base font-semibold text-white hover:text-cyan-400 transition-colors">
                {dashboardLabel}
              </Link>
              <span className="text-base font-semibold text-zinc-500 opacity-50 cursor-not-allowed">
                {settingsLabel}
              </span>
            </>
          ) : (
            <>
              <Link href={ROUTES.HOME} onClick={() => setIsOpen(false)} className="text-base font-semibold text-white hover:text-cyan-400 transition-colors">{homeLabel}</Link>
              <Link href={ROUTES.LOGIN} onClick={() => setIsOpen(false)} className="text-base font-semibold text-white hover:text-cyan-400 transition-colors">{loginLabel}</Link>
              <Link href={ROUTES.REGISTER} onClick={() => setIsOpen(false)} className="text-base font-semibold text-white hover:text-cyan-400 transition-colors">
                {signupLabel}
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}