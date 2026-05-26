'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function HomeCarousel() {
  const [slide, setSlide] = useState<number>(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedTier, setSelectedTier] = useState(1); // Default to Pro (index 1)
  const next = () => setSlide((s) => (s + 1) % 4);
  const prev = () => setSlide((s) => (s + 4 - 1) % 4);
  const t = useTranslations('homeCarousel');

  // Touch handling for swipes
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    
    // Threshold of 50px for a swipe
    if (distance > 50) next();
    if (distance < -50) prev();
    
    setTouchStart(null);
  };

  useEffect(() => {
    if (showPaywall) return;

    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % 4);
    }, 8000); // Switch every 30 seconds

    return () => clearInterval(timer);
  }, [showPaywall, slide]);

  return (
    <section
      className="relative overflow-hidden flex flex-col items-center justify-start bg-transparent text-white min-h-[calc(100vh-var(--navbar-height))] h-auto pb-24 max-[607px]:bg-[linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('/background-mobile.png')] max-[607px]:bg-cover max-[607px]:bg-center backdrop-blur-[2px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Prev button */}
      <button
        onClick={prev}
        aria-label={t('previousSlideAria')}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/70 text-zinc-200 transition hover:border-cyan-300 hover:text-cyan-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Content */}
      <div className="px-6 text-center max-w-5xl w-full relative">
        {[0, 1, 2, 3].map((i) => {
          const isActive = i === slide;
          // When active, use relative to push container height. When inactive, hide with absolute.
          const offsetClass = isActive
            ? 'translate-x-0 opacity-100'
            : i < slide
            ? '-translate-x-6 opacity-0'
            : 'translate-x-6 opacity-0';

          return (
            <div
              key={i}
              className={`${isActive ? 'relative pointer-events-auto' : 'absolute inset-0 opacity-0 pointer-events-none'} flex flex-col items-center justify-start pt-[8vh] min-[608px]:pt-[10vh] min-[821px]:pt-[14vh] transition-all duration-500 ease-in-out ${offsetClass}`}
            >
              {i === 0 && (
                <>
                  <h1 className="mx-auto max-w-4xl text-3xl sm:text-4xl min-[821px]:text-5xl lg:text-6xl font-semibold leading-tight">
                    {t('slides.0.title')}
                  </h1>
                  <p className="mx-auto mt-6 text-sm sm:text-base min-[608px]:text-base min-[821px]:text-lg text-zinc-100 max-w-3xl">
                    {t('slides.0.subtitle')}
                  </p>
                  <div className="mt-8">
                    <Link
                      href="/login"
                      className="rounded-full border border-cyan-300/80 bg-cyan-400/10 px-6 py-3 min-[821px]:px-8 min-[821px]:py-4 text-sm min-[821px]:text-base font-semibold text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.24)] transition hover:bg-cyan-400/20"
                    >
                      {t('slides.0.cta')}
                    </Link>
                  </div>
                </>
              )}

              {i === 1 && (
                <>
                  <h1 className="mx-auto max-w-4xl text-3xl sm:text-4xl min-[608px]:text-4xl min-[821px]:text-5xl lg:text-6xl font-semibold leading-tight">{t('slides.1.title')}</h1>
                  <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 min-[608px]:grid-cols-2 min-[821px]:grid-cols-3 lg:gap-6">
                    {[0, 1, 2].map((j) => (
                      <div
                        key={j}
                        className={`flex flex-col items-start gap-3 border border-zinc-800 bg-zinc-900/40 p-5 min-[608px]:p-5 min-[821px]:p-6 text-left ${
                          j === 2 ? 'min-[608px]:max-[820px]:col-span-2 min-[608px]:max-[820px]:justify-self-center min-[608px]:max-[820px]:w-full min-[608px]:max-[820px]:max-w-[calc(50%-10px)]' : ''
                        }`}
                      >
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
                          {t(`slides.1.grid.${j}.title`)}
                        </span>
                        <p className="text-sm leading-relaxed text-zinc-200">
                          {t(`slides.1.grid.${j}.description`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {i === 2 && (
                <>
                  <h1 className="mx-auto max-w-4xl text-3xl sm:text-4xl min-[608px]:text-4xl min-[821px]:text-5xl lg:text-6xl font-semibold leading-tight">{t('slides.2.title')}</h1>
                  <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-8 min-[608px]:grid-cols-2 min-[821px]:grid-cols-3 min-[821px]:gap-10 lg:gap-12">
                    {[0, 1, 2].map((j) => (
                      <div 
                        key={j} 
                        className={`flex flex-col items-center text-center ${j === 2 ? 'min-[608px]:max-[820px]:col-span-2 min-[608px]:max-[820px]:justify-self-center' : ''}`}
                      >
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/50 font-mono text-xl font-bold text-cyan-400 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]">
                          0{j + 1}
                        </div>
                        <h3 className="mb-3 text-lg font-medium text-white">
                          {t(`slides.2.steps.${j}.title`)}
                        </h3>
                        <p className="text-sm leading-relaxed text-zinc-300">
                          {t(`slides.2.steps.${j}.description`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {i === 3 && (
                <>
                  <h1 className="mx-auto max-w-4xl text-2xl sm:text-3xl min-[608px]:text-3xl min-[821px]:text-[2.5rem] lg:text-5xl font-semibold leading-tight">{t('slides.3.title')}</h1>
                  <div className="mx-auto mt-6 max-w-4xl w-full pb-20">
                    <div className="grid grid-cols-1 min-[608px]:grid-cols-2 min-[821px]:grid-cols-3 gap-3 min-[821px]:gap-4">
                      {[0, 1, 2].map((j) => (
                        <div
                          key={j}
                          onClick={() => setSelectedTier(j)}
                          className={`flex cursor-pointer flex-col items-center text-center gap-1.5 p-4 min-[608px]:p-4 min-[821px]:p-5 border transition-all duration-300 ease-in-out hover:scale-[1.01] hover:border-cyan-500/40 rounded-xl ${
                            j === 2 ? 'min-[608px]:max-[820px]:col-span-2 min-[608px]:max-[820px]:justify-self-center min-[608px]:max-[820px]:w-full min-[608px]:max-[820px]:max-w-[calc(50%-6px)]' : ''
                          } ${
                            selectedTier === j 
                              ? 'border-cyan-500 bg-zinc-900/80 ring-1 ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                              : 'border-zinc-700 bg-zinc-900/60'
                          }`}
                        >
                          <h3 className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-[0.2em]">{t(`slides.3.tiers.${j}.name`)}</h3>
                          <div className="text-2xl font-bold font-mono text-white">{t(`slides.3.tiers.${j}.price`)}</div>
                          <div className="text-xs text-zinc-200 leading-relaxed">{t(`slides.3.tiers.${j}.detail`)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                      <button 
                        onClick={() => setShowPaywall(true)}
                        className="w-full min-[821px]:w-3/5 lg:w-1/2 px-6 py-3 min-[821px]:px-8 min-[821px]:py-4 bg-cyan-500 text-white text-sm min-[821px]:text-base font-semibold rounded-full shadow-lg hover:bg-cyan-600 transition-all active:scale-95"
                      >
                        {t('slides.3.cta')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Paywall Widget */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowPaywall(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0A0A0A] p-8 text-white shadow-2xl z-10">
            <button 
              onClick={() => setShowPaywall(false)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors"
              aria-label={t('paywall.closeAria')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold mb-2">{t('paywall.title')}</h2>
            <p className="text-zinc-400 text-sm mb-6 font-mono uppercase tracking-tight">{t('paywall.subtitle')}</p>
            
            <div className="mb-8 p-5 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">{t('paywall.tierLabel')}</p>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-2xl font-bold text-cyan-400 uppercase">{t(`slides.3.tiers.${selectedTier}.name`)}</span>
                  <p className="text-xs text-zinc-500 mt-1">{t(`slides.3.tiers.${selectedTier}.detail`)}</p>
                </div>
                <span className="font-mono text-xl font-bold text-white">{t(`slides.3.tiers.${selectedTier}.price`)}</span>
              </div>
            </div>

            <div className="space-y-6">
               <div className="text-center">
                  <p className="text-sm text-zinc-400 mb-4">{t('cryptomusPlaceholder')}</p>
                  <div className="h-40 border-2 border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center text-neutral-600 gap-3 group hover:border-cyan-500/30 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-xs font-mono uppercase tracking-widest">{t('paywall.checkoutLabel')}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={next}
        aria-label={t('nextSlideAria')}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/70 text-zinc-200 transition hover:border-cyan-300 hover:text-cyan-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators (four slides) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3 py-2 bg-zinc-900/20 backdrop-blur-sm rounded-full px-4">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`${t('goToSlideAria')} ${i + 1}`}
            className={
              i === slide
                ? 'h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)] cursor-pointer'
                : 'h-2.5 w-2.5 rounded-full bg-zinc-600 hover:bg-zinc-400 cursor-pointer'
            }
          />
        ))}
      </div>
    </section>
  );
}
