import { createClient } from '@utils/supabase/server';
import { routing } from '@/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_NEXT_PATHS = new Set([
  '/billing',
  '/checkout',
  '/dashboard',
  '/enter-new-password',
  '/settings',
]);

function resolveNextPath(value: string | null) {
  const candidate = value?.startsWith('/') ? value : `/${value ?? 'checkout'}`;
  const path = candidate.split('?')[0];

  return ALLOWED_NEXT_PATHS.has(path) ? candidate : '/checkout';
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale: localeParam } = await context.params;
  const locale = (routing.locales as readonly string[]).includes(localeParam)
    ? (localeParam as 'ru' | 'en')
    : (routing.defaultLocale as 'ru' | 'en');

  const code = request.nextUrl.searchParams.get('code');
  const nextPath = resolveNextPath(request.nextUrl.searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Build the localized redirect URL
      const targetUrl = new URL(`/${locale}${nextPath}`, request.url);
      const redirectResponse = NextResponse.redirect(targetUrl);

      if (nextPath === '/enter-new-password') {
        redirectResponse.cookies.set('systema_password_recovery', '1', {
          httpOnly: true,
          maxAge: 10 * 60,
          path: `/${locale}/enter-new-password`,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production' || request.url.startsWith('https'),
        });
      }

      return redirectResponse;
    }
  }

  // Redirect to login with error state if verification fails
  const errorParam = code ? 'auth_failed' : 'missing_code';
  return NextResponse.redirect(new URL(`/${locale}/login?error=${errorParam}`, request.url));
}
