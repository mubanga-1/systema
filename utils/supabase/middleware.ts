import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

export async function updateSession(
  request: NextRequest,
  response: NextResponse
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );

          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Enforce subscription gating for dashboard and other protected routes
  try {
    const pathname = request.nextUrl.pathname; // e.g. /en/dashboard
    const parts = pathname.split('/').filter(Boolean);
    const locale = parts[0] && routing.locales.includes(parts[0] as 'ru' | 'en') ? (parts[0] as 'ru' | 'en') : routing.defaultLocale;

    const authRequiredPaths = ['checkout', 'dashboard', 'settings'];
    const paidRequiredPaths = ['dashboard'];
    const guestOnlyPaths = ['login', 'register', 'reset-password'];
    const firstPath = parts[1] ?? parts[0] ?? '';
    const isLocaleHome =
      parts.length === 0 ||
      (parts.length === 1 && routing.locales.includes(parts[0] as 'ru' | 'en'));

    if (isLocaleHome && user) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    if (firstPath && guestOnlyPaths.includes(firstPath) && user) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    if (firstPath && authRequiredPaths.includes(firstPath)) {
      if (!user) {
        // No user - redirect to login
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      }

      if (paidRequiredPaths.includes(firstPath)) {
        const { data: profile } = await supabase.from('profiles').select('payment_status').eq('id', user.id).maybeSingle();
        const paymentStatus = (profile?.payment_status as string | undefined) ?? (user.user_metadata?.payment_status as string | undefined) ?? 'unpaid';
        if (paymentStatus.toLowerCase() !== 'paid') {
          // Redirect to checkout
          return NextResponse.redirect(new URL(`/${locale}/checkout`, request.url));
        }
      }
    }
  } catch (e) {
    // ignore gating errors and continue
    console.error('subscription gating middleware error', e);
  }

  return response;
}
