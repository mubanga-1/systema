import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@utils/supabase/server';
import { LanguageSwitcher } from './LanguageSwitcher';
import Image from 'next/image';
import { GuestNavTabs } from './GuestNavTabs';
import { NavbarLogo } from './NavbarLogo';
import { MobileMenu } from './MobileMenu';
import { ROUTES } from './routes';

type NavbarProps = {
  locale: 'ru' | 'en';
};

export async function Navbar({ locale }: NavbarProps) {
  const t = await getTranslations({ locale });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Treat anonymous users as guests so they see Home, Login, and Register
  const isRegisteredUser = Boolean(user && !user.is_anonymous);

  return (
    <header className="border-b border-cyan-200/20 bg-[linear-gradient(90deg,#061329_0%,#0A2B50_34%,#0E355E_68%,#154067_100%)] backdrop-blur sticky top-0 z-[60] h-14 transition-all duration-300">
      <nav className="mx-auto flex h-full max-w-6xl items-center px-4 relative">
        {/* Logo Unit - Anchored left on mobile (< 608px) */}
        <div className="flex flex-1 justify-start min-[608px]:flex-none">
          <div className="flex items-center gap-4 min-[821px]:gap-7">
            <NavbarLogo user={isRegisteredUser ? user : null}>
              <Image
                src="/systema-logo.svg"
                alt="Systema logo"
                width={48}
                height={48}
                className="h-8 w-8 min-[608px]:h-10 min-[608px]:w-10 min-[821px]:h-12 min-[821px]:w-12 transition-all"
                unoptimized
              />
              <span className="-ml-1 text-sm min-[821px]:text-base font-semibold uppercase tracking-[0.08em] text-white transition-all">
                SYSTEMA
              </span>
            </NavbarLogo>
          </div>
        </div>

        {/* Mobile Central Language Switcher (< 608px) */}
        <div className="flex flex-1 justify-center min-[608px]:hidden">
          <LanguageSwitcher />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden min-[608px]:flex flex-1 justify-start items-center gap-3 min-[821px]:gap-5 text-xs min-[821px]:text-sm font-medium text-zinc-200 ml-4">
        {isRegisteredUser ? (
            <>
              <Link href={ROUTES.DASHBOARD}>{t('dashboard')}</Link>
              <Link href={ROUTES.SETTINGS}>{t('settings')}</Link>
            </>
          ) : (
            <GuestNavTabs
              homeLabel={t('home')}
              loginLabel={t('login')}
              signupLabel={t('register')}
            />
          )}
          </div>

        {/* Right Side: Desktop Language Switcher & Mobile Hamburger */}
        <div className="flex flex-1 justify-end items-center gap-4 min-[608px]:flex-none">
          <div className="hidden min-[608px]:block">
            <LanguageSwitcher />
          </div>
          <div className="min-[608px]:hidden">
            <MobileMenu 
              user={isRegisteredUser ? user : null}
              homeLabel={t('home')}
              loginLabel={t('login')}
              signupLabel={t('register')}
              dashboardLabel={t('dashboard')}
              settingsLabel={t('settings')}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}
